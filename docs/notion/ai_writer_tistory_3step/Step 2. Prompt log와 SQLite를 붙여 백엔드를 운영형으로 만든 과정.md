# AI_Writer_TISTORY 2단계: Prompt log와 SQLite를 붙여 백엔드를 운영형으로 만든 과정

- 권장 슬러그: `ai-writer-tistory-step-2-backend-implementation`
- SEO 설명: `AI_Writer_TISTORY에서 Prompt log, SQLite, Express 라우트를 어떻게 붙여 운영형 백엔드로 만들었는지 정리한 2단계 글입니다.`
- 핵심 키워드: `prompt log`, `SQLite backend`, `AI_Writer_TISTORY`, `Express API`, `티스토리 글쓰기`
- 대표 이미지 ALT: `AI_Writer_TISTORY 백엔드 구현 메모와 로그 구조`

## 들어가며

서버 골격을 세웠다면 이제는 실제 데이터를 남겨야 했습니다. 글쓰기 자동화에서는 어떤 프롬프트가 어떤 결과를 만들었는지 남지 않으면 나중에 개선 포인트를 설명하기 어렵기 때문입니다.

## 이번 단계에서 집중한 문제

- 프롬프트 로그와 대화 기록을 분리해 회고가 가능해야 했습니다.
- SQLite 기반 저장 계층이 있어야 백엔드가 단발성 스크립트처럼 사라지지 않습니다.
- Express 라우트로 글쓰기 요청과 상태 확인을 같은 서버에서 다뤄야 했습니다.

## 이렇게 코드를 반영했다

### 1. SQLite 연결을 만드는 저장 계층
- 파일: `src/core/db/sqliteClient.ts`
- 왜 넣었는가: 자동화 글쓰기에서는 결과보다 이력이 더 중요할 때가 많기 때문입니다.

```typescript
export const createSqliteClient = async () => {
  const db = await open({ filename: env.SQLITE_DB_PATH, driver: sqlite3.Database });
  return { db };
};
```

### 2. 글쓰기 요청을 받는 Assistant 라우트
- 파일: `src/routes/assistant.route.ts`
- 왜 넣었는가: 입력, 응답, 로그 흐름을 라우트 단위로 정리해야 나중에 파이프라인과 연결하기 쉬웠습니다.

```typescript
router.post("/message", async (req, res) => {
  const result = await controller.handle(req.body);
  res.status(200).json({ ok: true, item: result });
});
```

## 적용 결과

- AI_Writer_TISTORY는 기록 가능한 백엔드라는 성격을 분명히 갖게 됐습니다.
- Prompt log와 SQLite가 결합되면서 품질 회고를 할 재료가 생겼습니다.
- Step 3의 발행 파이프라인을 올릴 준비가 완료됐습니다.

## 티스토리 SEO 정리 포인트

- 구현 글에서는 `왜 로그가 필요한가`를 실제 운영 문장으로 풀어 쓰는 편이 좋습니다.
- 코드 블록은 저장 계층과 라우트를 한 쌍으로 보여 주는 것이 읽기 쉽습니다.
- 로그 구조나 API 흐름 이미지를 중간 섹션에 넣는 구성이 잘 맞습니다.

## 마무리

이 단계부터 AI_Writer_TISTORY는 단순 초안 생성기가 아니라, 어떤 글이 어떻게 만들어졌는지 설명할 수 있는 백엔드로 바뀌기 시작했습니다.
