# ADR 001 · Next.js 15 App Router 채택

- 상태: Accepted
- 날짜: 2026-04-23
- 관련: `docs/01-project-brief.md` (기술 스택)

---

## 맥락 (Context)

모바일 청첩장은 다음 특성을 가진다.

- 콘텐츠 대부분이 **정적**(신랑/신부 이름, 예식 정보, 갤러리)이고, 동적 요소는 방명록·RSVP 등 일부에 한정된다.
- 외부 트래픽의 진입점이 거의 **카카오톡 공유 링크**이기 때문에, Open Graph 메타태그를 페이지별로 정확히 주입할 수 있어야 한다.
- 사용자(Fork해서 쓰는 개발자)는 **무료 호스팅**과 **원클릭 배포**를 기대한다.
- 이미지 최적화(WebP 변환, lazy loading, responsive sizes)는 청첩장의 체감 성능에 가장 큰 영향을 준다.

후보는 크게 세 가지였다.

1. **Next.js 15 (App Router)** — RSC · 파일 기반 라우팅 · 이미지 최적화 내장 · Vercel 궁합
2. **Next.js 15 (Pages Router)** — 생태계 자료 풍부, 하지만 레거시 경로
3. **Astro** — 정적 사이트에 최적, 용량 작음. 그러나 방명록 같은 인터랙티브 섬을 따로 설계해야 하고 Kakao SDK 통합 예시가 상대적으로 적음

## 결정 (Decision)

**Next.js 15 App Router**를 채택한다.

- 라우팅: `app/` 디렉토리 기반
- 기본 렌더링: Server Components (SSG). 인터랙션이 필요한 섹션만 `"use client"`로 분리
- 이미지: `next/image`
- 배포: Vercel (GitHub 자동 연동)

Pages Router는 쓰지 않는다. Astro는 향후 "초경량 v2" 옵션으로 재검토할 여지는 남기되 현재 버전에서는 배제.

## 결과 (Consequences)

**긍정:**

- SSG + ISR 혼합으로 무료 티어 안에서 빠른 응답 유지 가능.
- `generateMetadata`로 페이지별 OG 태그 주입이 간단 → 카카오 공유 미리보기 대응 쉬움.
- Vercel 원클릭 배포 가이드를 README에 그대로 쓸 수 있어 "5분 배포" 목표와 정렬됨.
- TypeScript 스키마(`invitation.config.ts`)를 Server Component에서 타입 그대로 import 가능.

**부정 / 주의:**

- Framer Motion, Kakao SDK 등 브라우저 API에 의존하는 라이브러리는 클라이언트 경계(`"use client"`)를 명확히 나눠야 한다. 잘못 나누면 번들 크기가 커진다.
- App Router의 캐싱 모델(fetch 캐시, `revalidate`)은 Pages Router보다 학습 곡선이 있다. 방명록 같이 실시간성이 중요한 섹션은 별도 패턴(클라이언트 Firestore 구독) 필요.
- 모바일 Safari에서 RSC 스트리밍이 드물게 지연되는 사례가 있다 — MVP 단계에서는 페이지 단위 SSG로 회피.

## 후속 작업

- 2주차 Next.js 초기화 시 `--app` 플래그 사용 확정
- 클라이언트/서버 경계 가이드를 `.claude/rules/section-component.md`(신규)에 정리
