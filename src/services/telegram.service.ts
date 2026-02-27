import { Express } from "express";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { env } from "../core/env";
import { logger } from "../core/logger";

export interface TelegramTextMessageInput {
  chatId: string;
  username?: string;
  text: string;
}

export interface TelegramTextMessageOutput {
  replyText: string;
  route?: string;
  routeLabel?: string;
  reason?: string;
  ragCount?: number;
}

interface TelegramIntegrationOptions {
  app: Express;
  emitMonitoringEvent: (eventName: string, payload: Record<string, unknown>) => void;
  onTextMessage?: (input: TelegramTextMessageInput) => Promise<TelegramTextMessageOutput>;
}

const isAllowedChat = (chatId: string): boolean => {
  if (env.allowedTelegramChatIds.size === 0) {
    return true;
  }

  return env.allowedTelegramChatIds.has(chatId);
};

const buildWebhookUrl = (): string => {
  const normalizedBase = env.TELEGRAM_WEBHOOK_URL.replace(/\/$/, "");
  return `${normalizedBase}${env.TELEGRAM_WEBHOOK_PATH}`;
};

export const initializeTelegramIntegration = async ({
  app,
  emitMonitoringEvent,
  onTextMessage,
}: TelegramIntegrationOptions): Promise<void> => {
  if (!env.TELEGRAM_BOT_TOKEN) {
    logger.warn("TELEGRAM_BOT_TOKEN이 없어 텔레그램 기능을 비활성화합니다.");
    return;
  }

  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.catch((error) => {
    logger.error("텔레그램 업데이트 처리 중 오류가 발생했습니다.", {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  bot.start(async (ctx) => {
    const chatId = String(ctx.chat.id);

    if (!isAllowedChat(chatId)) {
      await ctx.reply("이 채팅은 현재 비서 사용 허용 목록에 없습니다.");
      return;
    }

    await ctx.reply("AI_BISEO 비서가 연결되었습니다. 메시지를 보내면 로컬 라우터가 판단 후 응답합니다.");

    emitMonitoringEvent("telegram:message", {
      type: "start",
      chatId,
      username: ctx.from?.username,
      text: "/start",
    });
  });

  bot.on(message("text"), async (ctx) => {
    const chatId = String(ctx.chat.id);

    if (!isAllowedChat(chatId)) {
      await ctx.reply("이 채팅은 현재 비서 사용 허용 목록에 없습니다.");
      return;
    }

    const incomingText = ctx.message.text;

    let response: TelegramTextMessageOutput = {
      replyText: `수신한 메시지: ${incomingText}\n(현재는 Phase 1 기본 응답 모드입니다.)`,
      route: "fallback",
    };

    if (onTextMessage) {
      response = await onTextMessage({
        chatId,
        username: ctx.from?.username,
        text: incomingText,
      });
    }

    await ctx.reply(response.replyText);

    emitMonitoringEvent("telegram:message", {
      type: "text",
      chatId,
      username: ctx.from?.username,
      text: incomingText,
      reply: response.replyText,
      route: response.route,
      routeLabel: response.routeLabel,
      reason: response.reason,
      ragCount: response.ragCount,
    });
  });

  let webhookActive = false;

  if (env.TELEGRAM_MODE === "webhook" || env.TELEGRAM_MODE === "both") {
    if (env.TELEGRAM_WEBHOOK_URL) {
      const callbackOptions = env.TELEGRAM_SECRET_TOKEN
        ? { secretToken: env.TELEGRAM_SECRET_TOKEN }
        : undefined;

      app.use(bot.webhookCallback(env.TELEGRAM_WEBHOOK_PATH, callbackOptions));

      const webhookOptions = env.TELEGRAM_SECRET_TOKEN
        ? { secret_token: env.TELEGRAM_SECRET_TOKEN }
        : undefined;

      await bot.telegram.setWebhook(buildWebhookUrl(), webhookOptions);
      webhookActive = true;

      logger.info("텔레그램 Webhook 모드를 활성화했습니다.", {
        webhookPath: env.TELEGRAM_WEBHOOK_PATH,
      });
    } else {
      logger.warn("TELEGRAM_WEBHOOK_URL이 비어 있어 Webhook 모드를 건너뜁니다.");
    }
  }

  const pollingRequired = env.TELEGRAM_MODE === "polling" || (env.TELEGRAM_MODE === "both" && !webhookActive);

  if (pollingRequired) {
    await bot.launch({ dropPendingUpdates: true });

    logger.info("텔레그램 Polling 모드를 활성화했습니다.");
  }

  if (env.TELEGRAM_MODE === "both" && webhookActive) {
    logger.info("텔레그램 both 모드에서 Webhook 우선 전략을 사용합니다.");
  }

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};
