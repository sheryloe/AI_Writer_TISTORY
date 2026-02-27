export interface ModuleStubResult {
  moduleId: string;
  action: string;
  status: "stub";
  message: string;
}

// TODO(Phase 2): n8n 블로그 파이프라인 실호출(Webhook Trigger + 콜백 추적)로 교체합니다.
export const triggerBlogWorkflowStub = async (commandText: string): Promise<ModuleStubResult> => {
  return {
    moduleId: "AI_Writer_TISTORY",
    action: "trigger_blog_workflow",
    status: "stub",
    message: `Phase 1 스텁: 블로그 모듈 호출 요청을 수신했습니다.\n요청: ${commandText}`,
  };
};

// TODO(Phase 3): 로컬 C++ 프로세스 상태 조회/제어 래퍼와 연결합니다.
export const getTradingStatusStub = async (commandText: string): Promise<ModuleStubResult> => {
  return {
    moduleId: "AUTO_TRADING",
    action: "get_trading_status",
    status: "stub",
    message: `Phase 1 스텁: 오토 트레이딩 상태 조회 요청을 수신했습니다.\n요청: ${commandText}`,
  };
};

// TODO(Phase 4): 가계부 SQLite 조회 로직(수입/지출/급여 집계)과 연결합니다.
export const queryLedgerStub = async (commandText: string): Promise<ModuleStubResult> => {
  return {
    moduleId: "LEDGER",
    action: "query_ledger",
    status: "stub",
    message: `Phase 1 스텁: 가계부 조회 요청을 수신했습니다.\n요청: ${commandText}`,
  };
};

// TODO(Phase 4): AI 코딩 산출물 이력/RAG 조회 엔진과 연결합니다.
export const queryCodingHistoryStub = async (commandText: string): Promise<ModuleStubResult> => {
  return {
    moduleId: "CODING_HISTORY",
    action: "query_coding_history",
    status: "stub",
    message: `Phase 1 스텁: 코딩 이력 조회 요청을 수신했습니다.\n요청: ${commandText}`,
  };
};
