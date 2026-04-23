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

## Next.js 16 주의사항

Next.js 16 으로 시작했다. **학습 데이터에 기반한 구형 API 사용 방지**를 위한 체크리스트:

- **`cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` 는 모두 async.** 접근 시 반드시 `await` — Next 15 까지 남아있던 동기 호환이 16 에서 완전히 제거됨.
- **미들웨어는 `proxy.ts`.** `middleware.ts` 는 deprecated. 새 코드는 `proxy.ts` 에, 함수 이름도 `proxy` 로. (edge runtime 필요 시만 `middleware.ts` 유지)
- **`<Image quality={x} />` 사용 시 주의.** 기본 허용값이 `[75]` 로 축소됐다. 다른 값을 쓰려면 `next.config.ts` 의 `images.qualities` 에 명시적으로 추가해야 하며, 허용 목록 밖의 값은 가장 가까운 값으로 강제된다.
- **AGENTS.md 경고 엄수.** 스캐폴드가 루트에 `AGENTS.md` 를 생성했고 요지는 "이전 Next.js 와 다름, 훈련 데이터의 API 를 우선 의심하고 공식 docs 확인". `node_modules/next/dist/docs/` 내 가이드를 최우선 참조.

상세 배경: `docs/adr/003-nextjs-version-choice.md`.

## 자주 쓰는 명령어

초기화 전(현재 상태):

- 아직 `package.json`이 없음. 2주차에 `npx create-next-app@latest . --typescript --tailwind --app --eslint` 로 초기화.

초기화 후에는 아래 명령어들이 사용 가능해질 예정:

- `npm run dev` — 로컬 개발 서버 (http://localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사
- `npm run typecheck` — 타입 체크 (별도 스크립트로 추가 예정)

## 일하는 방식 (Claude와 함께)

새 세션에서 작업 시작할 때:

1. `git log --oneline -10` 으로 최근 커밋 확인
2. `docs/retrospective/` 에서 가장 최근 주차 회고 읽기 (있으면)
3. 현재 진행 중인 주차의 가이드 문서(예: `docs/02-week01-daily-guide.md`) 확인
4. 다음 태스크 한 개를 제안하고, 사용자 승인 후 진행

중요 작업 규칙:

- **한 번에 하나의 완결된 태스크**만 수행. 여러 주차 분량을 한 번에 끝내려 하지 않는다.
- 코드 작성 전 어떤 파일을 건드릴지 먼저 브리핑한다.
- `invitation.config.ts`의 스키마를 변경할 때는 `docs/adr/` 에 결정 기록을 남긴다.

## 세부 규칙 위치 (Progressive Disclosure)

특정 영역 작업 시 관련 규칙 파일을 함께 읽을 것:

- 카카오 SDK 관련 작업: `.claude/rules/kakao-sdk.md`
- Firebase/방명록 관련 작업: `.claude/rules/firebase.md`
- 테마 시스템 관련 작업: `.claude/rules/theming.md`
- 새 섹션 컴포넌트 추가: `.claude/rules/section-component.md`

(위 파일들은 필요 시점에 만들 것. 지금은 CLAUDE.md에만 핵심 원칙이 있음.)
