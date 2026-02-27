import { randomUUID } from "crypto";

import { RagRepository } from "./ragRepository";
import { SqliteDatabase } from "./sqliteClient";

export type ConversationRole = "user" | "assistant" | "system";

export interface ConversationMessage {
  id: number;
  sessionId: string;
  chatId: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
}

export interface CreateConversationMessageInput {
  sessionId: string;
  chatId: string;
  role: ConversationRole;
  content: string;
}

export class ConversationRepository {
  constructor(
    private readonly db: SqliteDatabase,
    private readonly ragRepository: RagRepository,
  ) {}

  public async createMessage(input: CreateConversationMessageInput): Promise<ConversationMessage> {
    const now = new Date().toISOString();

    const result = await this.db.run(
      `
      INSERT INTO conversation_messages(session_id, chat_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [input.sessionId, input.chatId, input.role, input.content, now],
    );

    const messageId = Number(result.lastID ?? 0);

    if (messageId > 0 && input.role === "user") {
      // 자기 응답을 다시 색인하면 품질이 악화되므로 사용자 메시지만 RAG 대상으로 저장합니다.
      await this.ragRepository.upsertDocument({
        id: `conv_${input.chatId}_${messageId}_${randomUUID()}`,
        source: `conversation:${input.chatId}`,
        title: `${input.role} 메시지`,
        content: input.content,
        metadata: {
          chatId: input.chatId,
          sessionId: input.sessionId,
          role: input.role,
          createdAt: now,
        },
      });
    }

    return {
      id: messageId,
      sessionId: input.sessionId,
      chatId: input.chatId,
      role: input.role,
      content: input.content,
      createdAt: now,
    };
  }

  public async searchMessagesByChat(chatId: string, query: string, limit = 5): Promise<ConversationMessage[]> {
    const like = `%${query}%`;

    const rows = await this.db.all<{
      id: number;
      session_id: string;
      chat_id: string;
      role: ConversationRole;
      content: string;
      created_at: string;
    }[]>(
      `
      SELECT id, session_id, chat_id, role, content, created_at
      FROM conversation_messages
      WHERE chat_id = ?
        AND content LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [chatId, like, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      chatId: row.chat_id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));
  }

  public async listRecentMessagesByChat(chatId: string, limit = 8): Promise<ConversationMessage[]> {
    const rows = await this.db.all<{
      id: number;
      session_id: string;
      chat_id: string;
      role: ConversationRole;
      content: string;
      created_at: string;
    }[]>(
      `
      SELECT id, session_id, chat_id, role, content, created_at
      FROM conversation_messages
      WHERE chat_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [chatId, limit],
    );

    return rows
      .map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        chatId: row.chat_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }))
      .reverse();
  }
}
