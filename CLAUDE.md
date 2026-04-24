# invitation-kit

> 한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿.
> Config 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조.

## WHY (이 프로젝트의 존재 이유)

한국 결혼식 문화에 맞는 오픈소스 모바일 청첩장이 부족하다. 해외 OSS는 Config 구조는 좋지만 한국 기능(카카오톡 공유, 네이버/카카오 지도, 한국 계좌 시스템)이 없고, 국내 OSS는 대부분 개인용 하드코딩이라 재사용이 어렵다. 이 프로젝트는 두 장점을 결합한다.

자세한 기획 배경은 `docs/01-project-brief.md` 참고.

## WHAT (현재 스코프)

- 3개월(12주) 로드맵의 사이드 프로젝트
- MVP(v0.1.0, 5~6주차): 메인 · 인사말 · 갤러리 · 지도 버튼 · 계좌 복사 · 카카오톡 공유
- v1.0.0(10주차): 방명록 · D-day · 캘린더 · 다중 테마(3종+)
- 현재 단계는 `docs/` 안의 회고 파일(`retrospective/week-XX.md`)에서 확인. 없으면 아직 1주차 중.

전체 로드맵: `docs/02-week01-daily-guide.md`

## HOW (기술 스택과 개발 방식)

### 스택

- Next.js 16 (App Router, Turbopack 기본) · TypeScript · Tailwind CSS
- Framer Motion (애니메이션)
- Firebase Firestore (방명록/RSVP)
- Vercel (배포)
- Kakao SDK + 네이버 지도 딥링크

### 핵심 원칙

1. **Config-driven이 절대 원칙.** 사용자는 `invitation.config.ts` 한 파일만 수정한다. 하드코딩된 개인 정보를 컴포넌트에 직접 넣지 않는다. 신규 기능 추가 시 반드시 config 스키마에 필드를 정의한다.

2. **한국 결혼식이 1순위 타깃.** 기본값·UX·카피는 한국 문화 기준으로 설계한다. i18n은 v1.1 이후 과제.

3. **MIT 라이선스에 맞는 의존성만 사용.** GPL/AGPL 라이브러리 금지.

4. **모바일 Safari가 최우선 브라우저.** iOS의 `100vh` 이슈(`dvh` 사용), 무음 모드의 오디오 자동재생 차단을 항상 전제한다.

5. **README-Driven Development.** 새 기능은 먼저 README나 docs에 사용법을 쓰고, 그에 맞춰 구현한다.

### 커밋 컨벤션 — Conventional Commits

- `feat:` 새 기능 · `fix:` 버그 수정 · `docs:` 문서 · `style:` 포매팅 · `refactor:` 리팩터 · `test:` 테스트 · `chore:` 설정·빌드
- 커밋 메시지는 한국어로 작성. Conventional Commits 타입 (`feat:`, `fix:`, `chore:` 등) 은 영어 유지. 예: `feat(theme): 폰트 self-host`. 2주차 Day 1, Day 2 커밋 2건은 영어로 남아있는데, git history 일관성보다 force-push 회피를 우선해 그대로 둠.

### 파일 구조 (목표)

```
app/                    # Next.js App Router 페이지
components/
  sections/            # Main, Gallery, Venue, Guestbook ...
  theme/               # 테마별 스타일 토큰
  shared/              # 공통 UI
lib/                   # kakao, firebase, clipboard 헬퍼
public/images/gallery/ # 사용자 사진
invitation.config.ts   # 유일한 설정 진입점
docs/                  # 기획, 가이드, ADR, 회고
```

**진행 상태 (7주차 종료 시점):** `app/` (page·layout — `<html data-theme={config.theme}>` + Pretendard · Cormorant · Playfair Display 3 폰트), `app/globals.css` (`@theme` Classic 기본 + `:root[data-theme="modern"]` override + `--radius-sm` 토큰), `app/fonts/` (Pretendard Variable), `components/sections/` (Main · Greeting · Gallery · Venue · Accounts · Share — Venue 에 카카오맵·네이버지도·구글 캘린더 3 버튼), `components/` 최상위 (`DDayBadge` · `InAppBrowserNotice` — sections 외 Client 컴포넌트), `lib/` (`map.ts` 카카오맵·네이버 지도 · `calendar.ts` 구글 캘린더 · `kakao.ts` Kakao SDK wrapper · `clipboard.ts` · `date.ts` · `userAgent.ts`), `public/images/og.png` · `public/images/gallery/sample-01~09.jpg`, `.env.example` 존재, `CHANGELOG.md` · `package.json` 메타 완성. `v0.1.0` 태그 + GitHub Release 공개. `components/theme/`, `components/shared/` 여전히 미도입 — 테마 시스템이 `@theme` + CSS 변수 override 로 해결돼 별도 컴포넌트 레이어 불필요해졌음. `ThemeName = "classic" | "modern"` (Week 8 에 floral 확장 예정).

## Next.js 16 주의사항

Next.js 16 으로 시작했다. **학습 데이터에 기반한 구형 API 사용 방지**를 위한 체크리스트:

- **`cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` 는 모두 async.** 접근 시 반드시 `await` — Next 15 까지 남아있던 동기 호환이 16 에서 완전히 제거됨.
- **미들웨어는 `proxy.ts`.** `middleware.ts` 는 deprecated. 새 코드는 `proxy.ts` 에, 함수 이름도 `proxy` 로. (edge runtime 필요 시만 `middleware.ts` 유지)
- **`<Image quality={x} />` 사용 시 주의.** 기본 허용값이 `[75]` 로 축소됐다. 다른 값을 쓰려면 `next.config.ts` 의 `images.qualities` 에 명시적으로 추가해야 하며, 허용 목록 밖의 값은 가장 가까운 값으로 강제된다.
- **AGENTS.md 경고 엄수.** 스캐폴드가 루트에 `AGENTS.md` 를 생성했고 요지는 "이전 Next.js 와 다름, 훈련 데이터의 API 를 우선 의심하고 공식 docs 확인". `node_modules/next/dist/docs/` 내 가이드를 최우선 참조.

상세 배경: `docs/adr/003-nextjs-version-choice.md`.

## 애니메이션 사용 규칙

3주차·4주차에서 모바일 Safari 검증을 거쳐 확립된 분리:

- **on-mount/페이지 로드 페이드는 CSS** (`@keyframes` + `animate-*` 유틸). 예: `app/globals.css` 의 `animate-fade-in-up`.
- **framer-motion 의 `initial → animate` 패턴 금지.** `motion.*` 의 `initial` prop 은 SSR HTML 에 인라인 style (`opacity:0`, `transform`) 을 박는데 iOS Safari 26 에서 hydration 후 풀리지 않는 회귀가 있어 텍스트가 영구 invisible 이 된다. 3주차 Main 흰 화면, 4주차 Greeting `whileInView` 회귀로 두 번 확인됨. `whileInView` 도 같은 메커니즘이라 동일하게 금지.
- **framer-motion 은 JS-only 영역에만**: `AnimatePresence` (마운트/언마운트 전환), 제스처(`drag`, `whileHover`, `whileTap`), 명시적 사용자 인터랙션 트리거 등. 패키지는 유지.
- 새로운 진입 애니메이션이 필요하면 먼저 CSS keyframe 으로 시도, JS-only 가 정말 필요하면 `mounted` state 로 첫 페인트 이후에만 invisible 상태를 도입.

## 자주 쓰는 명령어

- `npm run dev` — 로컬 개발 서버 (http://localhost:3000, Turbopack)
- `npm run build` — 프로덕션 빌드 (Turbopack)
- `npm run start` — 프로덕션 빌드 결과 실행
- `npm run lint` — ESLint (flat config, `eslint-config-prettier` 연결)
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` — Prettier 로 일괄 포맷 (Tailwind 클래스 정렬 포함)
- `npm run format:check` — 포맷 검증 (CI 에서 사용)

## 일하는 방식 (Claude와 함께)

새 세션에서 작업 시작할 때:

1. `git log --oneline -10` 으로 최근 커밋 확인
2. `docs/retrospective/` 에서 가장 최근 주차 회고 읽기 (있으면)
3. docs/00-roadmap.md 확인 — 이번 주차가 전체 12주 중 어디쯤인지, 다음 주차 계획과 어떻게 연결되는지 파악
4. 현재 진행 중인 주차의 가이드 문서(예: `docs/02-week01-daily-guide.md`) 확인
5. 다음 태스크 한 개를 제안하고, 사용자 승인 후 진행

중요 작업 규칙:

- **한 번에 하나의 완결된 태스크**만 수행. 여러 주차 분량을 한 번에 끝내려 하지 않는다.
- 코드 작성 전 어떤 파일을 건드릴지 먼저 브리핑한다.
- `invitation.config.ts`의 스키마를 변경할 때는 `docs/adr/` 에 결정 기록을 남긴다.
- 주차 끝에 docs/retrospective/week-XX.md 를 작성할 때, docs/00-roadmap.md 도 함께 업데이트할 것:
  · 해당 주차 섹션을 "진행 중/예정" → "완료"로 변경
  · 실제 결과물, 배운 것, 예상과 달랐던 점 채우기
  · 전체 진행 상황 바 갱신 (X/12)
  · "마지막 업데이트" 날짜 갱신
  · 다음 주차 계획에 "회고에서 넘어온 태스크" 반영

## 세부 규칙 위치 (Progressive Disclosure)

특정 영역 작업 시 관련 규칙 파일을 함께 읽을 것:

- 카카오 SDK 관련 작업: `.claude/rules/kakao-sdk.md`
- Firebase/방명록 관련 작업: `.claude/rules/firebase.md`
- 테마 시스템 관련 작업: `.claude/rules/theming.md`
- 새 섹션 컴포넌트 추가: `.claude/rules/section-component.md`

(위 파일들은 필요 시점에 만들 것. 지금은 CLAUDE.md에만 핵심 원칙이 있음.)
