import { Router } from "express";

import { ModuleRegistry } from "../modules/base/moduleRegistry";

interface ModuleRouterOptions {
  registry: ModuleRegistry;
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

export const createModuleRouter = ({ registry }: ModuleRouterOptions): Router => {
  const router = Router();

  router.get("/", async (_req, res) => {
    const modules = registry.listModules();
    const items = await Promise.all(
      modules.map(async (module) => ({
        moduleId: module.moduleId,
        moduleName: module.moduleName,
        monitoringStatus: await module.getMonitoringStatus(),
      })),
    );

    res.status(200).json({
      ok: true,
      items,
    });
  });

  router.get("/:moduleId/status", async (req, res) => {
    const module = registry.getModule(req.params.moduleId);

    if (!module) {
      res.status(404).json({ ok: false, message: "모듈을 찾을 수 없습니다." });
      return;
    }

    const status = await module.getMonitoringStatus();
    res.status(200).json({ ok: true, item: status });
  });

  router.get("/:moduleId/config", async (req, res) => {
    const module = registry.getModule(req.params.moduleId);

    if (!module) {
      res.status(404).json({ ok: false, message: "모듈을 찾을 수 없습니다." });
      return;
    }

    const config = await module.getConfig();
    res.status(200).json({ ok: true, item: config });
  });

  router.patch("/:moduleId/config", async (req, res) => {
    const module = registry.getModule(req.params.moduleId);

    if (!module) {
      res.status(404).json({ ok: false, message: "모듈을 찾을 수 없습니다." });
      return;
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({ ok: false, message: "설정 패치는 객체 형식이어야 합니다." });
      return;
    }

    const updated = await module.updateConfig(req.body as Record<string, unknown>);
    res.status(200).json({ ok: true, item: updated });
  });

  router.get("/:moduleId/history", async (req, res) => {
    const module = registry.getModule(req.params.moduleId);

    if (!module) {
      res.status(404).json({ ok: false, message: "모듈을 찾을 수 없습니다." });
      return;
    }

    const limit = parseLimit(req.query.limit);
    const history = await module.listHistory(limit);

    res.status(200).json({
      ok: true,
      items: history,
      limit,
    });
  });

  return router;
};
