import { Router } from "express";

import { AiWriterPipelineTracker } from "../modules/ai_writer_tistory/pipelineTracker";

interface AiWriterPipelineRouterOptions {
  tracker: AiWriterPipelineTracker;
}

const parseLimit = (rawLimit: unknown): number => {
  if (typeof rawLimit !== "string") {
    return 30;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed)) {
    return 30;
  }

  return Math.max(1, Math.min(parsed, 200));
};

export const createAiWriterPipelineRouter = ({ tracker }: AiWriterPipelineRouterOptions): Router => {
  const router = Router();

  router.get("/runs", (req, res) => {
    const limit = parseLimit(req.query.limit);
    const items = tracker.listRuns(limit);

    res.status(200).json({
      ok: true,
      limit,
      items,
    });
  });

  router.get("/runs/:runId", (req, res) => {
    const run = tracker.getRun(req.params.runId);

    if (!run) {
      res.status(404).json({ ok: false, message: "요청한 파이프라인 실행 이력을 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      ok: true,
      item: run,
    });
  });

  return router;
};
