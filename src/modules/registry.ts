import { ModuleRegistry } from "./base/moduleRegistry";
import { InMemoryAssistantModule } from "./base/inMemoryAssistantModule";

export const createDefaultModuleRegistry = (): ModuleRegistry => {
  const registry = new ModuleRegistry();

  registry.registerModule(
    new InMemoryAssistantModule({
      moduleId: "AI_BISEO",
      moduleName: "메인 AI 비서",
      initialStatus: {
        stage: "bootstrap",
        message: "메인 서버 초기화 대기",
      },
    }),
  );

  registry.registerModule(
    new InMemoryAssistantModule({
      moduleId: "AI_Writer_TISTORY",
      moduleName: "블로그 에이전트",
      initialStatus: {
        stage: "idle",
        message: "n8n 트리거 대기",
      },
    }),
  );

  registry.registerModule(
    new InMemoryAssistantModule({
      moduleId: "TREND_PARSER",
      moduleName: "실시간 트렌드 파서",
      initialStatus: {
        stage: "idle",
        message: "초기 구현 대기",
      },
    }),
  );

  registry.registerModule(
    new InMemoryAssistantModule({
      moduleId: "AUTO_TRADING",
      moduleName: "오토 트레이딩",
      initialStatus: {
        stage: "idle",
        message: "C++ 래퍼 연결 대기",
      },
    }),
  );

  registry.registerModule(
    new InMemoryAssistantModule({
      moduleId: "CODING_HISTORY",
      moduleName: "AI 코딩 이력 관리",
      initialStatus: {
        stage: "idle",
        message: "초기 구현 대기",
      },
    }),
  );

  return registry;
};

export const moduleRegistry = createDefaultModuleRegistry();
