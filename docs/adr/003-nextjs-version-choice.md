# ADR 003 · Next.js 16 채택 (15 대신)

- 상태: Accepted
- 날짜: 2026-04-23
- 관련: `docs/adr/001-use-nextjs-app-router.md` (App Router 결정, Next 15 기준으로 작성됨)

---

## 맥락 (Context)

1주차 ADR 001 과 CLAUDE.md 는 **Next.js 15 App Router** 를 채택한다고 명시했다. 그러나 2주차 초기화 시점(2026-04-23)에 `npx create-next-app@latest` 가 실제로 설치한 버전은 **Next.js 16.2.4** (React 19.2.4) 였다. Next.js 16 은 2025-10-21 에 릴리즈된 메이저 버전으로, 아래 변경이 있다.

- 동기 `cookies()/headers()/params/searchParams` 접근이 완전히 제거되고 async 만 허용
- `middleware.ts` → `proxy.ts` 로 컨벤션 변경 (기존 파일은 deprecated)
- Turbopack 이 dev/build 기본 번들러로 승격
- `next lint` 명령 제거 (`eslint` CLI 직접 사용)
- `next/image` 기본값 변경 (`minimumCacheTTL` 60s→4h, `qualities` 전체→`[75]`)
- Node.js 최소 요구 버전 20.9+
- 스캐폴드가 `AGENTS.md` 를 생성해 "학습 데이터와 API 가 다르다" 고 명시적으로 경고

선택지는 두 가지였다.

1. **Next.js 16 을 유지**하고 문서·규칙에 반영
2. `/tmp` 스캐폴드 파기 후 `create-next-app@15` 로 재시작

## 결정 (Decision)

**Next.js 16 을 유지**한다.

## 이유

1. **MVP 스코프가 Next 16 breaking changes 와 거의 무관하다.** 청첩장은 단일 정적 페이지 + 클라이언트 Firebase 구조로, 서버 `cookies/headers`, 미들웨어, 병렬 라우트, AMP, runtime config 를 **모두 사용하지 않는다**. 영향이 큰 변경점 대부분이 MVP 에는 노출되지 않는다.
2. **기술부채 회피.** 3개월 짜리 프로젝트에서 15 로 시작하면 수개월 내 16 으로 올려야 한다. 지금 한 번의 학습 비용으로 프로젝트 수명 내내 업그레이드가 불필요하다.
3. **빌드·개발 속도 개선이 바로 체감된다.** Turbopack 기본화로 dev HMR 과 production build 가 각각 ~10×, ~2–5× 빨라진다. 로컬 반복이 많은 청첩장 개발 특성에 유리하다.
4. **Node 20.9+, TypeScript 5.1+ 요구를 로컬에서 이미 충족**한다 (Node v24.14.0).

## 결과 (Consequences)

**긍정:**

- React 19.2 의 View Transitions, Activity 등 UI 애니메이션 관련 신기능을 즉시 활용할 수 있어 청첩장의 부드러운 섹션 전환 UX 와 잘 맞는다.
- `next/image` 기본 캐시 TTL 이 4h 로 늘어나 갤러리 이미지의 재검증 비용이 감소 — 청첩장 같이 **거의 변하지 않는 콘텐츠**에는 오히려 이상적.
- `next lint` 제거에 따라 스캐폴드가 생성한 `"lint": "eslint"` 스크립트가 이미 신규 CLI 방식이므로 추후 마이그레이션 불필요.
- Turbopack 기본화로 개발 경험이 개선된다.

**부정 / 주의:**

- **훈련 데이터 불일치 위험.** AGENTS.md 가 명시하듯 AI 보조 코드 생성 시 Next 15 이하 패턴(동기 `params`, `middleware.ts`, `images.domains` 등)이 튀어나올 수 있다. CLAUDE.md 의 "Next.js 16 주의사항" 섹션과 `node_modules/next/dist/docs/` 로 가드레일을 둔다.
- **튜토리얼·블로그 생태계가 아직 15 중심.** 공식 docs 와 release blog 가 1차 레퍼런스.
- 추후 서드파티 라이브러리(Framer Motion, Kakao SDK 등)가 React 19 호환 이슈를 보일 경우 임시 우회가 필요할 수 있다.

## 후속 작업

- [x] `CLAUDE.md` 스택 표기 "15 → 16", "Turbopack 기본" 반영
- [x] `CLAUDE.md` 에 "Next.js 16 주의사항" 섹션 추가
- [ ] `docs/adr/001-...md` 는 역사적 기록으로 보존 (Next 15 언급 수정하지 않음). 본 ADR 이 버전 결정에 한해 supersede.
- [ ] Day 6(`app/page.tsx` 에 config 연결) 작업 시 `PageProps` 타입 헬퍼(`npx next typegen`) 활용 검토
