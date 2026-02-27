import path from "path";
import { mkdir } from "fs/promises";

import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";

import { env } from "../env";
import { logger } from "../logger";

export type SqliteDatabase = Database<sqlite3.Database, sqlite3.Statement>;

const buildSchemaSql = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

CREATE TABLE IF NOT EXISTS conversation_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_chat_created
  ON conversation_messages(chat_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rag_documents (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rag_documents_updated
  ON rag_documents(updated_at DESC);

CREATE TABLE IF NOT EXISTS llm_call_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  route TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_llm_call_logs_chat_created
  ON llm_call_logs(chat_id, created_at DESC);
`;

export interface SqliteClient {
  db: SqliteDatabase;
  close: () => Promise<void>;
}

const resolveDbPath = (): string => {
  const absolutePath = path.resolve(process.cwd(), env.SQLITE_DB_PATH);
  return absolutePath;
};

const ensureDbDirectory = async (absoluteDbPath: string): Promise<void> => {
  const directoryPath = path.dirname(absoluteDbPath);
  await mkdir(directoryPath, { recursive: true });
};

export const createSqliteClient = async (): Promise<SqliteClient> => {
  const absoluteDbPath = resolveDbPath();
  await ensureDbDirectory(absoluteDbPath);

  const db = await open({
    filename: absoluteDbPath,
    driver: sqlite3.Database,
  });

  await db.exec(buildSchemaSql);

  if (env.SQLITE_VEC_EXTENSION_PATH) {
    logger.warn("Phase 1에서는 SQLite(vec) 확장 로딩을 자동화하지 않습니다. Phase 2에서 확장 로더를 연결할 예정입니다.", {
      extensionPath: env.SQLITE_VEC_EXTENSION_PATH,
    });
  }

  logger.info("로컬 SQLite 연결이 준비되었습니다.", {
    dbPath: absoluteDbPath,
  });

  return {
    db,
    close: async () => {
      await db.close();
      logger.info("SQLite 연결을 종료했습니다.");
    },
  };
};
