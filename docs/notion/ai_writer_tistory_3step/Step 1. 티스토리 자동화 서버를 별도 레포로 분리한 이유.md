# AI_Writer_TISTORY 1단계: 티스토리 자동화 서버를 별도 레포로 분리한 이유

- 권장 슬러그: `ai-writer-tistory-step-1-server-architecture`
- SEO 설명: `AI_Writer_TISTORY를 왜 별도 레포로 두고 글쓰기 자동화 서버로 설계했는지 설명하는 1단계 글입니다.`
- 핵심 키워드: `AI_Writer_TISTORY`, `티스토리 자동화`, `AI 글쓰기 서버`, `Express TypeScript`, `콘텐츠 운영`
- 대표 이미지 ALT: `AI_Writer_TISTORY 서버 아키텍처 설계 초안`

## 들어가며

티스토리 글쓰기 자동화는 프롬프트 생성기 하나로 끝나지 않았습니다. 초안 관리, 운영 로그, 발행 전 검토, 외부 워크플로 연결까지 따로 봐야 했기 때문에 별도 서버 레포가 필요했습니다.

## 이번 단계에서 집중한 문제

- 초안 생성과 운영 기록을 분리하지 않으면 수정 이력이 금방 사라졌습니다.
- 티스토리 발행 전 단계는 외부 워크플로와 엮이기 때문에 서버형 구조가 필요했습니다.
- 환경 변수와 저장소 경로를 먼저 정리해야 확장 비용을 줄일 수 있었습니다.

## 이렇게 코드를 반영했다

### 1. 개발/빌드/노션 동기화 스크립트 분리
- 파일: `package.json`
- 왜 넣었는가: 글쓰기 서버의 작업 목적을 명확하게 보이게 하기 위함입니다.

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc -p tsconfig.json",
  "notion:push:workspace": "tsx scripts/push-bootstrap-worklogs-to-notion.ts"
}
```

### 2. 운영 기본값을 묶은 환경 변수 스키마
- 파일: `src/core/env.ts`
- 왜 넣었는가: 티스토리 자동화는 외부 연동이 많아 빈 값과 기본값을 코드에서 먼저 통제해야 안전했기 때문입니다.

```typescript
const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  DASHBOARD_STATIC_DIR: z.string().default("./dashboard/public"),
  NOTION_API_KEY: z.string().default(""),
});
```

## 적용 결과

- AI_Writer_TISTORY를 단순 스크립트가 아닌 운영형 백엔드로 설명할 기준이 생겼습니다.
- AI, Notion, 티스토리, 운영 로그를 같은 구조로 정리했습니다.
- Step 2에서 실제 구현 이야기를 이어 갈 바닥이 만들어졌습니다.

## 티스토리 SEO 정리 포인트

- `왜 별도 서버로 분리했나` 같은 질문형 제목이 잘 맞습니다.
- 도입부에서는 자동화보다 운영 피로를 먼저 언급하는 편이 공감이 좋습니다.
- 아키텍처 메모나 폴더 구조 이미지를 초반에 배치하면 좋습니다.

## 마무리

Step 1의 목적은 기능 자랑이 아니라, 티스토리 자동화가 오래 굴러가려면 어떤 기준이 먼저 필요한지 설명하는 데 있었습니다.
