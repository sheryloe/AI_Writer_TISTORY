# AI_Writer_TISTORY

티스토리 발행 자동화와 AI 글쓰기 흐름을 Node.js와 TypeScript로 구성한 백엔드 중심 저장소입니다.

- Repository: https://github.com/sheryloe/AI_Writer_TISTORY
- Live page: https://sheryloe.github.io/AI_Writer_TISTORY/
- Audience: 티스토리 자동 발행, AI 초안 작성, 운영 로그 축적을 함께 하고 싶은 개인 운영자

## Overview
티스토리 글 작성과 운영 자동화를 위한 AI Writer 서버

## Why This Exists
티스토리용 글쓰기 자동화는 초안 생성, 프롬프트 로그, 발행 전 상태 관리가 분리되면 운영 난도가 급격히 높아집니다.

## What You Can Do
- TypeScript 기반 Express 서버 구조
- 프롬프트 로그와 운영 기록을 저장하는 로컬 스토리지 구조
- OpenAI 및 Notion 연동을 전제로 한 자동화 스크립트
- 대시보드와 서버 소스가 함께 포함된 운영형 저장소

## Typical Flow
- 환경 변수와 API 키 구성
- 개발 서버 실행
- AI 초안 생성과 티스토리 운영 자동화 흐름 점검

## Tech Stack
- Node.js 20+
- TypeScript
- Express
- SQLite
- Docker Compose

## Quick Start
- `.env.example`을 복사해 환경 변수를 설정합니다.
- `npm install` 후 `npm run dev`로 개발 서버를 실행합니다.
- 배포 전에는 `npm run build`로 TypeScript 빌드를 확인합니다.

## Repository Structure
- `src/`: 서버 로직
- `scripts/`: 운영 자동화 보조 스크립트
- `dashboard/`, `docs/`: 관리 화면과 문서

## Search Keywords
`tistory ai writer`, `tistory automation nodejs`, `AI writer backend`, `티스토리 자동화`, `AI 글쓰기 서버`

## FAQ
### AI_Writer_TISTORY는 무엇을 자동화하나요?
티스토리용 AI 글쓰기 초안과 운영 로그 축적, 발행 준비 흐름을 자동화합니다.

### 어떤 환경에서 개발하나요?
Node.js 20 이상과 TypeScript, Express 기반으로 개발합니다.

### 대시보드도 포함되나요?
포함됩니다. `dashboard/`와 `docs/`에 운영 화면 관련 파일이 들어 있습니다.

