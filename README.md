# AI_Writer_TISTORY

티스토리 글쓰기 자동화와 AI 초안 생성 흐름을 Node.js 백엔드 중심으로 구성한 발행 자동화 프로젝트입니다.

- 저장소: `https://github.com/sheryloe/AI_Writer_TISTORY`
- GitHub Pages: `https://sheryloe.github.io/AI_Writer_TISTORY/`

## 서비스 개요

- 티스토리 운영자가 초안 생성, 운영 로그, 발행 준비를 한 흐름으로 관리할 수 있게 설계했습니다.
- AI 초안 생성 이후 사람 검토와 발행 준비 단계까지 고려한 백엔드 저장소입니다.

## 핵심 기능

- TypeScript 기반 Express 서버
- Prompt log 및 운영 기록 저장 구조
- OpenAI, Notion 연동을 고려한 자동화 스크립트
- 대시보드와 문서 자산 포함

## 기술 스택

- Node.js 20+
- TypeScript
- Express
- SQLite
- Docker Compose

## 실행 방법

```bash
npm install
npm run dev
```

배포 전 빌드 확인은 아래 명령으로 진행합니다.

```bash
npm run build
```

## 디렉터리

- `src/`: 서버 로직
- `scripts/`: 발행/운영 자동화 보조 스크립트
- `dashboard/`, `docs/`: 운영 화면과 공개 문서
- `prompt_log/`: 생성 히스토리

## 다음 단계

- 발행 전 승인 큐와 검수 체크리스트 강화
- 티스토리 API 실패 복구 흐름 정리
- 블로그별 말투 프리셋과 SEO 점검 로직 추가
