import axios from "axios";

import { env } from "../env";
import { logger } from "../logger";
import {
  AssistantLlmProvider,
  LlmGenerateInput,
  LlmGenerateOutput,
  LlmMessage,
} from "./types";

interface OllamaChatResponse {
  model?: string;
  message?: {
    role?: string;
    content?: string;
  };
}

interface OllamaTagsResponse {
  models?: Array<{
    name?: string;
  }>;
}

const toNormalizedModel = (name: string): string => name.trim().toLowerCase();

const toErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = (error.response?.data as { error?: string } | undefined)?.error;
    if (responseData) {
      return `HTTP ${error.response?.status} ${error.response?.statusText ?? ""} ${responseData}`.trim();
    }

    const code = error.code ?? "axios_error";
    const base = error.message?.trim() || "요청 실패";
    return `${code}: ${base}`;
  }

  if (error instanceof Error) {
    return error.message || "오류 메시지 없음";
  }

  return String(error);
};

const normalizeText = (value: string): string => {
  return value.replace(/\s+/g, " ").trim();
};

const buildPromptPreview = (messages: LlmMessage[]): string => {
  const lines = messages.map((message) => `${message.role.toUpperCase()}: ${normalizeText(message.content)}`);
  const joined = lines.join("\n");
  if (joined.length <= 600) {
    return joined;
  }

  return `${joined.slice(0, 600)}...`;
};

class NoopAssistantLlmProvider implements AssistantLlmProvider {
  public async generate(input: LlmGenerateInput): Promise<LlmGenerateOutput> {
    return {
      provider: env.ASSISTANT_LLM_PROVIDER,
      model: "disabled",
      text: "",
      promptPreview: buildPromptPreview(input.messages),
    };
  }
}

class OllamaAssistantLlmProvider implements AssistantLlmProvider {
  private async resolveBaseUrls(): Promise<string[]> {
    const baseUrl = env.OLLAMA_BASE_URL.replace(/\/$/, "");
    const candidateBaseUrls = [baseUrl];

    if (baseUrl.includes("host.docker.internal")) {
      candidateBaseUrls.push(baseUrl.replace("host.docker.internal", "localhost"));
    } else if (baseUrl.includes("localhost")) {
      candidateBaseUrls.push(baseUrl.replace("localhost", "host.docker.internal"));
    }

    return [...new Set(candidateBaseUrls)];
  }

  private async ensureModelExists(baseUrl: string): Promise<string | null> {
    const tagsResponse = await axios.get<OllamaTagsResponse>(`${baseUrl}/api/tags`, {
      timeout: env.OLLAMA_REQUEST_TIMEOUT_MS,
    });

    const candidates = (tagsResponse.data.models ?? [])
      .map((model) => model.name)
      .filter((name): name is string => Boolean(name))
      .map(toNormalizedModel);

    const targetModel = toNormalizedModel(env.OLLAMA_MODEL);
    if (candidates.includes(targetModel)) {
      return env.OLLAMA_MODEL;
    }

    if (candidates.length === 0) {
      return null;
    }

    return candidates[0];
  }

  public async generate(input: LlmGenerateInput): Promise<LlmGenerateOutput> {
    const candidateBaseUrls = await this.resolveBaseUrls();

    let lastError: unknown;

    for (const candidateBaseUrl of candidateBaseUrls) {
      try {
        const model = await this.ensureModelExists(candidateBaseUrl);
        if (!model) {
          throw new Error("설치된 Ollama 모델이 없습니다.");
        }

        if (model !== env.OLLAMA_MODEL) {
          logger.warn("요청 모델이 없어 대체 모델로 폴백합니다.", {
            requested: env.OLLAMA_MODEL,
            fallback: model,
          });
        }

        const response = await axios.post<OllamaChatResponse>(
          `${candidateBaseUrl}/api/chat`,
          {
            model,
            messages: input.messages,
            stream: false,
          },
          {
            timeout: env.OLLAMA_REQUEST_TIMEOUT_MS,
          },
        );

        const text = response.data.message?.content?.trim() ?? "";
        if (!text) {
          throw new Error("Ollama 응답 본문이 비어 있습니다.");
        }

        return {
          provider: "ollama",
          model: response.data.model ?? env.OLLAMA_MODEL,
          text,
          promptPreview: buildPromptPreview(input.messages),
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Ollama 호출 실패");
  }
}

const createProvider = (): AssistantLlmProvider => {
  if (env.ASSISTANT_LLM_PROVIDER === "ollama") {
    return new OllamaAssistantLlmProvider();
  }

  if (env.ASSISTANT_LLM_PROVIDER === "gemini_cli") {
    logger.warn("gemini_cli 공급자는 아직 구현되지 않아 LLM 생성을 건너뜁니다.");
    return new NoopAssistantLlmProvider();
  }

  return new NoopAssistantLlmProvider();
};

export class AssistantLlmService {
  private readonly provider: AssistantLlmProvider;

  constructor() {
    this.provider = createProvider();
  }

  public async generate(input: LlmGenerateInput): Promise<LlmGenerateOutput | null> {
    try {
      const result = await this.provider.generate(input);
      if (!result.text) {
        return null;
      }

      return result;
    } catch (error) {
      logger.warn("LLM 응답 생성에 실패했습니다. Phase 1 기본 응답으로 폴백합니다.", {
        provider: env.ASSISTANT_LLM_PROVIDER,
        route: input.route,
        error: toErrorMessage(error),
      });
      return null;
    }
  }
}
