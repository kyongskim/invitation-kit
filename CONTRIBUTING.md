# 기여하기

`invitation-kit` 에 관심 가져주셔서 감사합니다. 이 문서는 첫 PR 까지 가는 흐름과 알아두면 좋은 규칙을 정리합니다. 영문 독자는 README.en.md 의 컨트리뷰팅 섹션 + 본 문서의 명령어/체크리스트만 따라가도 충분합니다.

## 환영하는 기여

- **새 테마** — Classic·Modern·Floral 외 4 번째 테마. [테마 가이드](./docs/theme-guide.md) 의 5 단계 그대로
- **버그 신고·수정** — [bug 템플릿](./.github/ISSUE_TEMPLATE/bug.md) 으로 이슈 먼저 생성
- **문서 개선** — 가이드 3 종 (`docs/api-keys.md` · `docs/config-guide.md` · `docs/theme-guide.md`) 보강, 영문 번역, 회고 오타 정정
- **기능 제안** — [feature_request 템플릿](./.github/ISSUE_TEMPLATE/feature_request.md) 으로 토론 시작 후 PR

## 환영 안 하는 기여 (스코프 밖)

본 프로젝트는 OSS 청첩장 템플릿 의 명확한 스코프를 유지합니다. 아래 영역은 PR 보내기 전 이슈로 합의 필수:

- **카카오 비즈니스 채널 · 결제** — `.claude/rules/kakao-sdk.md` 의 "Scope" 섹션 참조
- **Firebase Auth · Cloud Functions · Admin SDK** — `.claude/rules/firebase.md` 의 "Scope" 섹션. 본인 삭제 (Cloud Function 프록시) 는 v1.1+ 후보
- **웹 기반 config 편집기 UI** — v1.1+ 후보, 별도 합의 필요
- **외부 결제 연동, BGM 자동재생** — 한국 결혼식 청첩장 톤 결정
- **다국어 UI (i18n)** — v1.1+ 후보. README/가이드 영문 번역은 환영

## 개발 환경 setup

```bash
git clone https://github.com/YOUR_USERNAME/invitation-kit.git
cd invitation-kit
npm install
npm run dev    # http://localhost:3000 (Turbopack)
```

Node 24+ 권장 (GitHub Actions CI 가 Node 24). Next.js 16 (App Router · Turbopack) 사용 — `cookies()`, `headers()`, `params`, `searchParams` 가 모두 async 인 점 등 Next 16 주의사항은 [`CLAUDE.md`](./CLAUDE.md) 의 "Next.js 16 주의사항" 섹션 참조.

## 자주 쓰는 명령어

| 명령                   | 설명                                           |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | 개발 서버 (Turbopack)                          |
| `npm run build`        | 프로덕션 빌드                                  |
| `npm run start`        | 프로덕션 빌드 결과 실행                        |
| `npm run lint`         | ESLint (flat config)                           |
| `npm run typecheck`    | `tsc --noEmit`                                 |
| `npm run format`       | Prettier 일괄 포맷 (Tailwind 클래스 정렬 포함) |
| `npm run format:check` | 포맷 검증 (CI 에서 사용)                       |

## 표준 quality gate (PR 보내기 전)

```sh
rm -f .eslintcache && npm run lint && npm run typecheck && npm run format:check && npm run build
```

`format:check` 누락이 가장 흔한 CI 실패 원인. `npm run format` 만 돌리고 stage 안 잡으면 빨간불. `.eslintcache` 비우는 이유는 React 19 `react-hooks/set-state-in-effect` rule 이 캐시를 놓쳐 "로컬 통과 / CI 실패" 갈림 사례 때문.

## 새 테마 PR 흐름

[테마 가이드](./docs/theme-guide.md) 의 5 단계 그대로:

1. `invitation.config.ts` 의 `ThemeName` union 에 새 테마 추가
2. `app/globals.css` 에 `:root[data-theme="새테마"]` 블록 + 9 변수 override
3. (필요 시) `app/layout.tsx` 에 새 폰트 로드 + 변수 등록
4. `docs/theme-guide.md` 에 worked example 추가 (Modern · Floral 패턴 미러)
5. PR 에 모바일·데스크톱 스크린샷 첨부 (`public/images/screenshots/theme-새테마.png` 1 컷 + 다중 테마 collage 갱신)

**컴포넌트 코드는 건드리지 않습니다** — Tailwind utility 가 CSS 변수를 자동 참조합니다 (ADR 005).

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 한국어 정책 — type 은 영어, scope 는 영어, 본문은 한국어:

- `feat(scope): 새 기능` · `fix(scope): 버그 수정` · `docs(scope): 문서` · `style(scope): 포매팅` · `refactor(scope): 구조 개선` · `test(scope): 테스트` · `chore(scope): 빌드·설정`
- 예: `feat(theme): 폰트 self-host` · `perf(font): Pretendard variable 2MB → 3 weight Korean subset`

## 모바일 Safari 검증 의무

본 프로젝트는 모바일 Safari 1순위 환경입니다. iOS 26 에서 framer-motion `motion.* initial` SSR 회귀 같은 이슈 다수 발견됨. 모든 UI PR 은:

- iPhone 실기기 또는 Xcode Simulator 에서 검증 (Chrome DevTools 시뮬레이터로는 부족)
- `dvh` 사용 (모바일 Safari 의 `100vh` 회피)
- 오디오 자동재생은 사용자 제스처 이후만
- 탭 영역 44pt+
- on-mount/페이지 로드 페이드는 CSS `@keyframes`, framer-motion 은 `AnimatePresence` · 제스처 · 명시적 인터랙션만

자세한 규칙: [`CLAUDE.md`](./CLAUDE.md) 의 "애니메이션 사용 규칙" 섹션.

## 개인정보 안전

- **실제 키 commit 금지** — `NEXT_PUBLIC_KAKAO_APP_KEY` · `NEXT_PUBLIC_FIREBASE_*` 모두 `.env.local` (gitignored) 만 사용
- **신랑·신부 실명·전화번호·계좌번호** 가 commit 에 포함되지 않았는지 PR 보내기 전 확인 — `git diff main` 로 grep
- 데모 사이트 (`invitation-kit.vercel.app`) 의 가상 커플 (`김철수 ♥ 이영희`) 이 `invitation.config.ts` 의 default — 이 default 는 OSS 정체성 유지를 위해 변경 금지 (본인 청첩장은 fork 후 수정)

## 라이선스

기여 = [MIT 라이선스](./LICENSE) 동의. 폰트 자원 (Pretendard) 은 SIL Open Font License 1.1 (`app/fonts/OFL.txt`) — 폰트 추가 시 라이선스 호환 확인 필수.

## 도움 받기

- **설계 결정 배경**: [`docs/adr/`](./docs/adr/) (현재 6 건)
- **영역별 작업 규칙**: [`.claude/rules/kakao-sdk.md`](./.claude/rules/kakao-sdk.md) · [`.claude/rules/firebase.md`](./.claude/rules/firebase.md)
- **주차별 회고**: [`docs/retrospective/`](./docs/retrospective/) — "왜 이렇게 결정했는가" 의 trace
- **전체 로드맵**: [`docs/00-roadmap.md`](./docs/00-roadmap.md)

질문은 [Discussions](../../discussions) 또는 [Issues](../../issues) 에서 자유롭게.
