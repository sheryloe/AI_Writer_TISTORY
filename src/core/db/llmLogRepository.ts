import { SqliteDatabase } from "./sqliteClient";

export interface LlmCallLog {
  id: number;
  sessionId: string;
  chatId: string;
  route: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  metadataJson?: string;
  createdAt: string;
}

export interface CreateLlmCallLogInput {
  sessionId: string;
  chatId: string;
  route: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  metadata?: Record<string, unknown>;
}

const toMetadataJson = (metadata?: Record<string, unknown>): string | null => {
  if (!metadata) {
    return null;
  }

  try {
    return JSON.stringify(metadata);
  } catch {
    return null;
  }
};

export class LlmLogRepository {
  constructor(private readonly db: SqliteDatabase) {}

  public async createLog(input: CreateLlmCallLogInput): Promise<LlmCallLog> {
    const now = new Date().toISOString();
    const metadataJson = toMetadataJson(input.metadata);

    const result = await this.db.run(
      `
      INSERT INTO llm_call_logs(
        session_id,
        chat_id,
        route,
        provider,
        model,
        prompt,
        response,
        metadata_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.sessionId,
        input.chatId,
        input.route,
        input.provider,
        input.model,
        input.prompt,
        input.response,
        metadataJson,
        now,
      ],
    );

    return {
      id: Number(result.lastID ?? 0),
      sessionId: input.sessionId,
      chatId: input.chatId,
      route: input.route,
      provider: input.provider,
      model: input.model,
      prompt: input.prompt,
      response: input.response,
      metadataJson: metadataJson ?? undefined,
      createdAt: now,
    };
  }
}
