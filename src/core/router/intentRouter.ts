export type AssistantRoute =
  | "rag_search"
  | "call_blog"
  | "call_trading_status"
  | "call_ledger"
  | "call_coding_history"
  | "fallback";

export interface IntentDecision {
  route: AssistantRoute;
  reason: string;
}

const includesAny = (source: string, keywords: string[]): boolean => {
  return keywords.some((keyword) => source.includes(keyword));
};

const BLOG_KEYWORDS = [
  "블로그",
  "포스팅",
  "티스토리",
  "글 작성",
  "글 써",
  "초안",
  "해시태그",
  "썸네일",
  "blog",
  "tistory",
  "posting",
  "post",
];

const TRADING_KEYWORDS = [
  "트레이딩",
  "매매",
  "포지션",
  "손익",
  "체결",
  "주문",
  "거래",
  "수익률",
  "trading",
  "trade",
  "position",
  "pnl",
];

const LEDGER_KEYWORDS = [
  "가계부",
  "지출",
  "수입",
  "급여",
  "잔액",
  "예산",
  "소비",
  "통장",
  "ledger",
  "expense",
  "income",
  "salary",
];

const CODING_HISTORY_KEYWORDS = [
  "코딩 이력",
  "코드 이력",
  "프로젝트 이력",
  "커밋",
  "리뷰",
  "리팩토링",
  "변경 이력",
  "coding history",
  "code history",
  "commit",
  "changelog",
];

const RAG_HINT_KEYWORDS = [
  "기억",
  "이전에",
  "지난",
  "정리",
  "설명",
  "왜",
  "무엇",
  "어떻게",
];

export const decideIntent = (text: string): IntentDecision => {
  const normalized = text.trim().toLowerCase();

  if (!normalized) {
    return {
      route: "fallback",
      reason: "입력 텍스트가 비어 있어 의도를 분류할 수 없습니다.",
    };
  }

  if (includesAny(normalized, BLOG_KEYWORDS)) {
    return {
      route: "call_blog",
      reason: "블로그/포스팅 관련 키워드가 감지되어 블로그 모듈 호출이 필요합니다.",
    };
  }

  if (includesAny(normalized, TRADING_KEYWORDS)) {
    return {
      route: "call_trading_status",
      reason: "트레이딩 상태 조회/제어 키워드가 감지되어 트레이딩 모듈 경로로 분기합니다.",
    };
  }

  if (includesAny(normalized, LEDGER_KEYWORDS)) {
    return {
      route: "call_ledger",
      reason: "가계부/재무 관련 키워드가 감지되어 로컬 가계부 조회 경로로 분기합니다.",
    };
  }

  if (includesAny(normalized, CODING_HISTORY_KEYWORDS)) {
    return {
      route: "call_coding_history",
      reason: "코딩 산출물/이력 관련 키워드가 감지되어 코딩 이력 모듈 경로로 분기합니다.",
    };
  }

  if (includesAny(normalized, RAG_HINT_KEYWORDS) || normalized.endsWith("?")) {
    return {
      route: "rag_search",
      reason: "설명/질의형 입력으로 판단되어 로컬 기억(RAG) 검색을 우선 수행합니다.",
    };
  }

  return {
    route: "rag_search",
    reason: "특정 모듈 호출 신호가 없어 기본 전략인 로컬 RAG 검색으로 처리합니다.",
  };
};

export const getRouteLabel = (route: AssistantRoute): string => {
  if (route === "rag_search") {
    return "로컬 RAG 검색";
  }

  if (route === "call_blog") {
    return "블로그 모듈 인터페이스";
  }

  if (route === "call_trading_status") {
    return "오토 트레이딩 모듈 인터페이스";
  }

  if (route === "call_ledger") {
    return "가계부 모듈 인터페이스";
  }

  if (route === "call_coding_history") {
    return "코딩 이력 모듈 인터페이스";
  }

  return "기본 응답";
};
