# AI_Writer_TISTORY 3단계: 티스토리 발행 파이프라인과 Notion 운영 로그를 묶은 결과

- 권장 슬러그: `ai-writer-tistory-step-3-pipeline-and-notion`
- SEO 설명: `AI_Writer_TISTORY에서 티스토리 발행 파이프라인과 Notion 운영 로그를 어떻게 연결했는지 정리한 3단계 글입니다.`
- 핵심 키워드: `티스토리 발행 파이프라인`, `Notion 운영 로그`, `AI_Writer_TISTORY step 3`, `콘텐츠 자동화`, `workflow logging`
- 대표 이미지 ALT: `AI_Writer_TISTORY 파이프라인과 Notion 기록 흐름`

## 들어가며

마지막 단계에서는 글 생성만으로 끝내지 않고, 어떤 단계까지 실행됐는지와 그 과정을 어디에 남길지를 함께 설계했습니다. 이 부분이 있어야 자동화가 단순 데모가 아니라 실제 운영 흐름이 됩니다.

## 이번 단계에서 집중한 문제

- 파이프라인을 `run` 단위로 볼 수 있어야 어느 단계에서 멈췄는지 알 수 있었습니다.
- Notion 기록은 단순 DB 저장이 아니라 작업 문맥을 글 형태로 남기는 구조여야 했습니다.
- 마지막 문단에서는 Repository와 Live Page 링크로 자연스럽게 이어져야 했습니다.

## 이렇게 코드를 반영했다

### 1. 파이프라인 실행 이력을 조회하는 라우트
- 파일: `src/routes/aiWriterPipeline.route.ts`
- 왜 넣었는가: 글쓰기 자동화의 핵심은 `지금 몇 단계까지 갔는가`를 운영자가 바로 아는 데 있기 때문입니다.

```typescript
router.get("/runs", (_req, res) => {
  res.status(200).json({ ok: true, items: tracker.listRuns() });
});
```

### 2. Notion용 작업 원고를 밀어 넣는 스크립트
- 파일: `scripts/push-bootstrap-worklogs-to-notion.ts`
- 왜 넣었는가: 개발 과정을 노션에 남겨 두면 티스토리 글감과 운영 로그를 같은 스토리라인으로 재활용할 수 있습니다.

```typescript
const notion = new Client({ auth: notionApiKey });
await notion.pages.create({ parent: { page_id: pageId }, properties, children });
```

## 적용 결과

- 글 생성 파이프라인과 운영 로그를 같은 이야기로 정리할 수 있게 됐습니다.
- 노션 기록을 티스토리용 발행 원고로 다시 풀어 쓰기 쉬운 구조가 만들어졌습니다.
- 프로젝트 소개 마지막 문단에서 저장소와 Live Page 링크를 연결할 근거가 생겼습니다.

## 티스토리 SEO 정리 포인트

- Step 3 글은 `결과가 남는다`보다 `과정이 남는다`는 메시지를 강조하는 편이 좋습니다.
- 노션, 티스토리, 파이프라인을 한 문장 안에 같이 넣으면 검색 의도를 넓게 잡을 수 있습니다.
- 하단 CTA는 저장소 링크와 소개 페이지를 나란히 배치하는 구성이 가장 안정적입니다.

## 마지막 페이지에 붙일 링크

- Repository: https://github.com/sheryloe/AI_Writer_TISTORY
- Live Page: https://sheryloe.github.io/AI_Writer_TISTORY/
- 추천 문장: `AI_Writer_TISTORY의 실제 코드와 소개 페이지는 아래 링크에서 바로 확인할 수 있습니다.`

## 마무리

AI_Writer_TISTORY의 Step 3은 기능 추가라기보다 운영 방식 정리였습니다. 이제 이 프로젝트는 글을 만들어 내는 서버이면서, 그 과정을 다시 콘텐츠로 설명할 수 있는 기록 시스템이기도 합니다.
