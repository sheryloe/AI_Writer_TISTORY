import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("*"),
  SOCKET_NAMESPACE: z.string().default("/monitoring"),

  TELEGRAM_BOT_TOKEN: z.string().default(""),
  TELEGRAM_MODE: z.enum(["polling", "webhook", "both"]).default("both"),
  TELEGRAM_WEBHOOK_URL: z.string().default(""),
  TELEGRAM_WEBHOOK_PATH: z.string().default("/webhooks/telegram"),
  TELEGRAM_SECRET_TOKEN: z.string().default(""),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().default(""),

  N8N_BLOG_TRIGGER_WEBHOOK_URL: z.string().default(""),
  N8N_BLOG_CALLBACK_BASE_PATH: z.string().default("/webhooks/n8n"),
  N8N_BLOG_CALLBACK_ROUTE: z.string().default("/blog/status"),
  N8N_BLOG_CALLBACK_SECRET: z.string().default(""),
  N8N_CALLBACK_SECRET_HEADER: z.string().default("X-N8N-SECRET"),

  DASHBOARD_SERVE_MODE: z.enum(["single", "separate"]).default("single"),
  DASHBOARD_STATIC_DIR: z.string().default("./dashboard/public"),

  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ASSISTANT_LLM_PROVIDER: z.enum(["none", "ollama", "gemini_cli"]).default("ollama"),
  ASSISTANT_LLM_SYSTEM_PROMPT: z.string().default(""),
  ASSISTANT_ROUTER_MODE: z.enum(["local_rule", "hybrid"]).default("local_rule"),
  ASSISTANT_SHOW_REASONING: z.enum(["true", "false"]).default("true"),
  RAG_DEFAULT_LIMIT: z.coerce.number().int().positive().default(5),
  RAG_SNIPPET_MAX_CHARS: z.coerce.number().int().positive().default(240),
  ASSISTANT_HISTORY_LIMIT: z.coerce.number().int().positive().default(8),

  OLLAMA_BASE_URL: z.string().default("http://host.docker.internal:11434"),
  OLLAMA_MODEL: z.string().default("qwen3"),
  OLLAMA_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),

  NOTION_API_KEY: z.string().default(""),
  NOTION_PARENT_PAGE_ID: z.string().default(""),
  NOTION_SERVICE_WORKER_SECRET: z.string().default(""),
  NOTION_LOG_ENABLED: z.enum(["true", "false"]).default("false"),

  SQLITE_DB_PATH: z.string().default("./storage/sqlite/ai_biseo.db"),
  SQLITE_VEC_EXTENSION_PATH: z.string().default(""),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsedEnv = envSchema.parse(process.env);

const allowedTelegramChatIds = new Set(
  parsedEnv.TELEGRAM_ALLOWED_CHAT_IDS.split(",")
    .map((chatId) => chatId.trim())
    .filter(Boolean),
);

export const env = {
  ...parsedEnv,
  ASSISTANT_SHOW_REASONING: parsedEnv.ASSISTANT_SHOW_REASONING === "true",
  NOTION_LOG_ENABLED: parsedEnv.NOTION_LOG_ENABLED === "true",
  allowedTelegramChatIds,
};
