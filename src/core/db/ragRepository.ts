import { randomUUID } from "crypto";

import { SqliteDatabase } from "./sqliteClient";

export interface RagDocument {
  id: string;
  source: string;
  title: string;
  content: string;
  metadataJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RagSearchResult {
  id: string;
  source: string;
  title: string;
  content: string;
  updatedAt: string;
  score: number;
}

export interface UpsertRagDocumentInput {
  id?: string;
  source: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

const toNow = (): string => new Date().toISOString();

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

export class RagRepository {
  constructor(private readonly db: SqliteDatabase) {}

  public async upsertDocument(input: UpsertRagDocumentInput): Promise<RagDocument> {
    const id = input.id ?? randomUUID();
    const now = toNow();

    await this.db.run(
      `
      INSERT INTO rag_documents(id, source, title, content, metadata_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        source = excluded.source,
        title = excluded.title,
        content = excluded.content,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at
      `,
      [
        id,
        input.source,
        input.title,
        input.content,
        toMetadataJson(input.metadata),
        now,
        now,
      ],
    );

    const row = await this.db.get<{
      id: string;
      source: string;
      title: string;
      content: string;
      metadata_json: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, source, title, content, metadata_json, created_at, updated_at FROM rag_documents WHERE id = ?`,
      [id],
    );

    if (!row) {
      throw new Error("RAG 문서 저장 후 조회에 실패했습니다.");
    }

    return {
      id: row.id,
      source: row.source,
      title: row.title,
      content: row.content,
      metadataJson: row.metadata_json ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async searchDocuments(query: string, limit = 5): Promise<RagSearchResult[]> {
    const like = `%${query}%`;

    const rows = await this.db.all<{
      id: string;
      source: string;
      title: string;
      content: string;
      updated_at: string;
      score: number;
    }[]>(
      `
      SELECT
        id,
        source,
        title,
        content,
        updated_at,
        (
          CASE WHEN title LIKE ? THEN 8 ELSE 0 END +
          CASE WHEN content LIKE ? THEN 3 ELSE 0 END +
          CASE WHEN source LIKE ? THEN 1 ELSE 0 END
        ) AS score
      FROM rag_documents
      WHERE title LIKE ? OR content LIKE ? OR source LIKE ?
      ORDER BY score DESC, updated_at DESC
      LIMIT ?
      `,
      [like, like, like, like, like, like, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      source: row.source,
      title: row.title,
      content: row.content,
      updatedAt: row.updated_at,
      score: row.score,
    }));
  }
}
