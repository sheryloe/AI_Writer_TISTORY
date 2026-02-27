# AI_BISEO 시스템 디렉토리 구조

```text
AI_BISEO/
├─ docker-compose.yml
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ src/
│  ├─ index.ts                      # 메인 진입점 (Express + Socket.io)
│  ├─ core/
│  │  ├─ env.ts                     # 환경변수 스키마/파싱
│  │  ├─ logger.ts                  # 로깅
│  │  ├─ db/                        # 로컬 SQLite 연결 및 저장소
│  │  ├─ llm/                       # LLM 공급자 계층(Ollama 등)
│  │  ├─ router/                    # 의도 분류 라우터
│  │  └─ orchestrator/              # RAG + Function Calling 오케스트레이터
│  ├─ routes/                       # HTTP/Webhook 라우터
│  ├─ services/                     # 텔레그램, Notion, OpenAI, n8n 연동 서비스
│  ├─ types/                        # 공통 타입
│  └─ modules/
│     ├─ interfaces/                # 외부 모듈 호출 인터페이스 스텁
│     ├─ ai_writer_tistory/         # n8n 기반 블로그 에이전트 어댑터
│     ├─ trend_parser/              # 실시간 트렌드 파서 모듈(신규)
│     ├─ auto_trading/              # 로컬 C++ 오토트레이딩 래퍼 모듈
│     └─ coding_history/            # AI 코딩 이력 관리 모듈(신규)
├─ dashboard/
│  ├─ public/                       # 대시보드 정적 리소스
│  └─ src/                          # 대시보드 프론트엔드 소스
├─ storage/
│  ├─ sqlite/                       # Host PC에 영속 저장되는 SQLite(vec) 데이터
│  └─ artifacts/                    # 모듈 산출물/로그 아카이브
├─ prompt_log/                      # 사용자-비서 프롬프트 대화 이력
├─ logs/                            # 런타임 로그 파일
└─ docs/
   └─ PROJECT_STRUCTURE.md
```

## 볼륨 마운트 원칙
- `storage/sqlite`와 `storage/artifacts`는 Host PC 경로로 유지하여 컨테이너 재생성 시에도 데이터가 보존됩니다.
- 컨테이너 내부 애플리케이션은 `/app/storage/*` 경로를 통해 데이터에 접근합니다.
