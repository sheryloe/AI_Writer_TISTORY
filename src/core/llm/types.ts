export type LlmMessageRole = "system" | "user" | "assistant";

export interface LlmMessage {
  role: LlmMessageRole;
  content: string;
}

export interface LlmGenerateInput {
  sessionId: string;
  chatId: string;
  route: string;
  messages: LlmMessage[];
}

export interface LlmGenerateOutput {
  provider: string;
  model: string;
  text: string;
  promptPreview: string;
}

export interface AssistantLlmProvider {
  generate(input: LlmGenerateInput): Promise<LlmGenerateOutput>;
}

