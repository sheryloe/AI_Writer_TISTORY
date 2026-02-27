import { Router } from "express";

import { RagRepository } from "../core/db/ragRepository";

interface RagRouterOptions {
  ragRepository: RagRepository;
}

const parseLimit = (rawLimit: unknown): number => {
  if (typeof rawLimit !== "string") {
    return 5;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed)) {
    return 5;
  }

  return Math.max(1, Math.min(parsed, 20));
};

export const createRagRouter = ({ ragRepository }: RagRouterOptions): Router => {
  const router = Router();

  router.get("/search", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      res.status(400).json({ ok: false, message: "q 파라미터가 필요합니다." });
      return;
    }

    const limit = parseLimit(req.query.limit);
    const items = await ragRepository.searchDocuments(query, limit);

    res.status(200).json({
      ok: true,
      query,
      limit,
      items,
    });
  });

  router.post("/documents", async (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;

    if (!body || typeof body !== "object") {
      res.status(400).json({ ok: false, message: "본문은 객체 형식이어야 합니다." });
      return;
    }

    const source = typeof body.source === "string" ? body.source.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!source || !title || !content) {
      res.status(400).json({ ok: false, message: "source/title/content 필드는 필수입니다." });
      return;
    }

    const item = await ragRepository.upsertDocument({
      id: typeof body.id === "string" ? body.id : undefined,
      source,
      title,
      content,
      metadata: typeof body.metadata === "object" && body.metadata !== null
        ? body.metadata as Record<string, unknown>
        : undefined,
    });

    res.status(201).json({ ok: true, item });
  });

  return router;
};
