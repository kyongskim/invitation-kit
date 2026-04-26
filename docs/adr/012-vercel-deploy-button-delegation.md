# ADR 012 — Vercel 배포 자동화 (Deploy Button 사용자 위임 · siteUrl 수동 backfill · env prefill)

- **Status**: Accepted (v2.0 Phase 4 진입 첫 결정)
- **Date**: 2026-04-26
- **Context**: ADR 010 의 v2.0 SaaS-lite 골격 — form 입력 → 본인 GitHub repo 자동 생성 → Vercel 자동 배포 → "5분 안에 배포" — 의 마지막 외부 시스템 연결이 Vercel. ADR 011 (GitHub) 은 GitHub App 의 fine-grained OAuth + popup callback + token transit-only 라는 깔끔한 패턴을 박았다. **본 ADR 작성 직전 Vercel docs 검증으로 같은 패턴이 Vercel 에선 불가능** 함을 확인 — Vercel "Sign in with Vercel" OAuth 토큰으로 `POST /v1/projects` 호출 시 `"You don't have permission to create the project"` 명시적 차단, Vercel 공식 답변은 "user-login-then-manage 기능은 현재 공개되지 않았다". 본 ADR 이 이 외부 한계를 받아들이고 v2.0 SaaS-lite 정체성을 유지하면서 Phase 4 의 호흡 (editor UI 의 "Vercel 배포" 섹션 + Deploy Button URL 생성 + siteUrl backfill 흐름) 구현 자유도를 좁힌다.

## 결정 (Accepted)

### 1. 인증/배포 호출 방식 — Deploy Button 사용자 위임 (Vercel REST API 직접 호출 거부)

editor 가 Vercel REST API 를 **직접 호출하지 않는다**. 대신 Deploy Button URL (`https://vercel.com/new/clone?...`) 을 editor 가 동적 생성 → 사용자가 클릭 → 본인 Vercel UI 안에서 GitHub repo import + env 입력 + 첫 배포까지 완수. 우리는 토큰을 보유·전송·요청하지 않음 — ADR 010·011 의 "데이터 보관 X" 약속을 가장 강한 형태로 유지.

선택 근거:

- **Vercel 의 외부 한계 그대로 수용** — OAuth user-to-server 토큰의 project create 권한 미공개 (Vercel 공식 답변, 2026-04 시점). 사용자 fork repo 가 다수 만들어지는 SaaS-lite 모델에 우회로 PAT 또는 Marketplace Integration 도입은 마찰·복잡도 큰 양보
- **사용자 환경에서 사용자 권한으로 진행** — 권한 분기·토큰 책임 0. 우리 서비스는 "URL 한 개 만들어 보냄" 만 — 가장 작은 attack surface. ADR 011 의 GitHub App user-to-server token (1h TTL, 메모리만) 보다 더 가벼운 책임 모델
- **Vercel UI 가 익숙한 인터페이스** — 사용자는 Vercel Dashboard 에서 매번 보던 "Import Project" 화면 그대로. 우리 editor 가 Vercel UX 를 재구현할 필요 0
- **GitHub repo 연결 자동 (Vercel for GitHub App)** — Deploy Button 흐름 안에서 사용자가 본인 GitHub 와 Vercel 을 한 번 연결하면 끝. 이후 push trigger 자동 배포까지 표준 경로

URL 생성 패턴 (의사):

```ts
// 의사코드 — lib/editor/vercel-deploy-url.ts
export function buildDeployButtonUrl(args: {
  repoUrl: string; // 예: https://github.com/<user>/<repo>
  projectName: string;
  envKeys: string[]; // ["NEXT_PUBLIC_FIREBASE_API_KEY", ...]
  envDescription?: string;
  envLink?: string; // 우리 docs/api-keys.md 같은 안내 URL
}): string {
  const params = new URLSearchParams();
  params.set("repository-url", args.repoUrl);
  params.set("project-name", args.projectName);
  params.set("env", args.envKeys.join(","));
  if (args.envDescription) params.set("envDescription", args.envDescription);
  if (args.envLink) params.set("envLink", args.envLink);
  return `https://vercel.com/new/clone?${params.toString()}`;
}
```

editor UI: PublishToGithub 의 "재 commit" 모드 (publishedRepo 있을 때) 와 같은 영역에 "Vercel 에 배포" 섹션 노출. 단순 anchor link `<a href={deployUrl} target="_blank">` 로 사용자를 Vercel 로 보냄.

### 2. env 등록 — Deploy Button URL 의 `env=...&envDescription=...&envLink=...` prefill

Vercel UI 의 env 입력 폼에 **키 이름은 미리 채워지고, 값만 사용자가 입력**. 우리 editor 가 보유한 키 목록은:

- `NEXT_PUBLIC_KAKAO_APP_KEY` (선택, 카카오 공유)
- `NEXT_PUBLIC_FIREBASE_API_KEY` 외 5 개 (선택, 방명록·RSVP 활성 시)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (선택, App Check)

선택 근거:

- **사용자가 복사붙임 1 회만** — Vercel UI 에 키 값만 붙여넣기. 키 이름 오타 0 (env name 는 우리가 박음)
- **`envDescription` 으로 컨텍스트** — "이 청첩장에 필요한 키 목록입니다. 자세한 발급 절차는 docs/api-keys.md 참조"
- **`envLink` 로 우리 가이드 직링크** — 사용자가 envDescription 에서 docs 링크 클릭 → 키 발급 절차 자세한 안내 (`docs/api-keys.md` 의 카카오 + Firebase 섹션). 비개발자 5분 배포 약속의 하나 남은 수동 단계 (외부 Console 키 발급) 의 마찰 최소화

config 의 활성 섹션에 따라 **envKeys 동적 결정** — `config.guestbook.enabled === false && config.rsvp.enabled === false` 면 Firebase 6 키 누락 OK (제외하면 사용자 입력 단계 0). 카카오 공유 미사용 시 카카오 키 제외. envKeys 는 editor store 의 config 를 보고 자동 결정.

### 3. siteUrl auto-fill — 사용자 backfill + re-commit 모드 활용 (webhook 자동화 거부)

Vercel 배포 후 deployment URL (예: `https://our-wedding-abc123.vercel.app`) 이 확정되면 사용자가 editor 의 MetaForm 의 `meta.siteUrl` 에 입력 + "변경사항 commit" (PublishToGithub 의 re-publish 모드, Phase 3-b 에서 이미 구현). Vercel 자동 재배포 → OG 메타 + 카카오 공유 썸네일 + share buttons 정상 동작.

선택 근거:

- **webhook 자동화는 우리 서비스 운영 인프라 (always-on endpoint) 필요** — Vercel deployment webhook 을 받으려면 사용자가 본인 Vercel project 의 Webhook 설정에 우리 endpoint 등록 + 우리 endpoint 가 사용자별 publishedRepo 매핑 보유 + 매핑 stateful = ADR 010 의 "데이터 보관 X" 약속 정면 위반
- **사용자 backfill 의 작업량은 ~30 초** — Vercel 배포 후 dashboard 의 deployment URL 복사 → editor 에 붙여넣기 → "변경사항 commit". UX 상 "배포 완료 후 한 줄 수정" 정도라 5분 약속 안에 들어옴
- **PublishToGithub re-publish 모드 재사용** — Phase 3-b 에서 이미 만든 흐름. 추가 코드 0. editor UI 가 "Vercel 배포 URL 을 받으면 MetaForm 의 siteUrl 에 입력 후 변경사항 commit" 안내 문구만 추가
- **첫 배포는 siteUrl placeholder 그대로** — 사용자가 form 에서 미리 채운 값 (또는 sample 의 `https://invitation-kit.vercel.app`) 으로 첫 commit. 첫 배포의 OG/공유는 부정확. 30 초 후 backfill commit 으로 정상화 — 첫 배포의 잠시 잘못된 OG 는 청첩장 도메인 위협 모델 약함 (사용자 본인이 첫 확인자, 외부 공유는 정정 후)

### 4. 배포 트리거 — Vercel for GitHub 의 push 자동 감지 (수동 트리거 거부)

Deploy Button 흐름의 마지막 단계가 "사용자가 본인 GitHub 에 Vercel for GitHub App install + repo 권한 부여 + 첫 배포 시작". 이 시점부터 **이후 GitHub push 가 자동으로 Vercel 배포 트리거** — editor 의 "변경사항 commit" 이 GitHub repo 에 push → Vercel 자동 재배포.

선택 근거:

- **Vercel 의 표준 동작** — 추가 setup 0건. Deploy Button 한 번 클릭으로 push trigger 까지 일괄 활성화
- **editor 가 별도 deploy API 호출 안 해도 됨** — `POST /v13/deployments` 같은 명시 호출은 토큰 보유 필요. 우리 토큰 0 정체성 정합
- **debounce 자연 처리** — 사용자가 이미지 9 장을 짧은 시간에 업로드 (= 9 commits) 해도 Vercel build 는 보통 마지막 commit 으로 1~2 회만 트리거 (Vercel 의 자체 debounce). 별도 처리 0

### 5. Deploy Button UI 노출 시점 — PublishToGithub re-publish 모드 안

editor 의 PublishToGithub 컴포넌트 (Phase 3-b) 에 두 모드 분기 — 첫 publish + re-publish — 가 이미 있음. **re-publish 모드 (publishedRepo 있을 때) 안에 "Vercel 에 배포" 섹션 추가**.

흐름:

1. 사용자 첫 publish (Phase 3-a-iii) → 신규 GitHub repo + 첫 config commit
2. PublishToGithub 가 re-publish 모드로 전환 → "Vercel 에 배포" Deploy Button 노출
3. 사용자 클릭 → 본인 Vercel 흐름 진행 → 배포 URL 확보
4. editor 로 돌아옴 → MetaForm 의 siteUrl 입력 + "변경사항 commit" → 자동 재배포

첫 publish 모드 (publishedRepo 없을 때) 에는 Deploy Button 을 노출하지 않음 — repo URL 이 없어서 Deploy Button URL 생성 불가 (의미 없음).

## 거부 대안

### 결정 1 (Vercel REST API 직접 호출)

#### A. Vercel "Sign in with Vercel" OAuth + REST API

거부. 위 Context 에 명시한 Vercel 외부 한계 — OAuth 토큰의 project create 차단. Vercel 공식 답변 "user-login-then-manage 비공개" (2026-04 시점). ADR 011 의 GitHub App 패턴 정합 매력 있으나 Vercel 측 미지원으로 막힘. Vercel 정책 변경 시 미래 트리거 1 에서 재검토

#### B. Personal Access Token (PAT)

거부. 사용자가 https://vercel.com/account/settings/tokens 에서 토큰 발급 → editor 입력 = ADR 011 의 PAT 거부 (대안 B) 와 같은 마찰. 5단계 (Vercel 가입 → tokens 페이지 → Create → 권한 선택 → 복사 → editor 붙여넣기). Vercel REST API 호출 전부 가능하나 editor 가 토큰 보유 = "데이터 보관 X" 약속의 책임 증가. 비개발자 진입의 첫 마찰

#### C. Vercel Marketplace Integration

거부. 거대한 흐름 — Create Integration form (필드 18+) + Vercel 검토 + 승인 + Native vs Connectable badge + 500+ install 까지 marketplace 등재 안 됨. OSS 청첩장 한 명 사용자용 templates 도구엔 과잉. 본 도메인 위협 모델·운영 부담·검토 사이클 모두 정합 안 됨

#### D. Vercel CLI (사용자 본인 환경 실행)

거부. 사용자가 본인 컴퓨터에 Node.js + npm + `vercel` CLI 설치 + `vercel login` (브라우저 OAuth) + `vercel link` + `vercel --prod` = 비개발자 입장 5단계 + 터미널 명령 = 청첩장 비개발자 5분 약속 정면 위반. 개발자에게는 자연스럽지만 v2.0 의 "비개발자 form 입력 5분 배포" 가설과 다름

### 결정 2 (env 등록)

#### E. 사용자가 Vercel 에서 처음부터 env 직접 입력

거부. 키 이름 오타 위험 + 우리 docs 안 보면 어떤 키가 필요한지 모름 + 6+ 키를 한 줄씩 추가 = 마찰 큼. Deploy Button 의 `env=KEY1,KEY2` prefill 은 같은 결과를 키 이름 자동으로 무료 제공

#### F. editor 가 사용자 키 입력받아 Vercel API 로 전송

거부. PAT 보유 (대안 B) 가 prerequisite — 결정 1 에서 거부됨. 또한 사용자가 우리 editor 에 Firebase·카카오 키 평문 입력 = 우리 server 가 transit 으로라도 받음 = "데이터 보관 X" 약속 양보. 사용자가 Vercel UI 안에서 직접 입력하면 우리 server 가 키를 보지 않음

### 결정 3 (siteUrl auto-fill)

#### G. Vercel deployment webhook 자동 수신

거부. 사용자가 본인 Vercel project Settings > Webhooks 에 우리 endpoint URL 등록 + 우리 endpoint 가 사용자별 publishedRepo 매핑 보유 (deployment URL ↔ user GitHub identity) + DB/KV 도입 = ADR 010·011 의 "데이터 보관 X" 약속 정면 위반. 또한 사용자 추가 setup 단계 (webhook 등록) 마찰 큼. 사용자 backfill 30 초 vs 매핑 인프라 영구 운영 = trade-off 명확

#### H. GitHub repo description 또는 homepage 필드로 Vercel 이 자동 등록 → editor 가 GitHub API 로 polling

거부. Vercel for GitHub App 이 deploy 후 repo 의 일부 메타를 갱신하긴 하지만 deployment URL 자동 박는 표준 동작 미공개. 만약 동작해도 polling 이 30초 이상 (배포 시간) 걸리고 사용자가 editor 떠나면 무의미. 단순 backfill 흐름이 더 직관

### 결정 4 (배포 트리거)

#### I. editor 가 명시적 `POST /v13/deployments` 호출

거부. PAT 보유 prerequisite (결정 1 거부 대안 B). Vercel for GitHub 의 push trigger 가 동일 결과를 토큰 0 으로 제공

### 결정 5 (Deploy Button UI 노출 시점)

#### J. 첫 publish 흐름 안에 "GitHub 만들기 + Vercel 만들기" 한 단계

거부. 두 외부 시스템 (GitHub + Vercel) 의 사용자 직접 작업 (App install · 권한 동의) 이 동시 진행되면 어디서 막혔는지 디버깅 어려움. ADR 011 의 검증 사이클이 GitHub 만으로도 1~2 호흡 걸렸음. 단계 분리 = 사용자 진단 가능

## 청첩장 도메인 적정 맥락

본 5 결정 묶음은 ADR 010·011 의 도메인 가정 (1회 setup · 사진 9~20장 · 결혼식 후 archive · 비개발자 진입 마찰 최소화) 위에 Vercel 외부 한계를 받아들이는 형태. 핵심 정합 축:

- **Deploy Button 사용자 위임** — 사용자 환경 안에서 Vercel UI 가 익숙한 인터페이스. 1회 setup 도메인에 정합 (반복 deploy 자동화 가치 작음)
- **siteUrl 사용자 backfill** — 30초 1회. 결혼식 1회 setup 의 5분 약속에서 30초 비중 작음
- **Vercel for GitHub push trigger** — 이후 변경 사항은 자동. 사용자가 editor 에서 form 수정 + "변경사항 commit" 만 하면 Vercel 알아서 재배포

**다른 도메인 fork 시 부적합 명시**:

- **반복 배포 자동화 도구 (CI/CD orchestrator)** — Deploy Button 위임은 1회 setup 에만 정합. 매일 수십 회 배포 시 PAT 또는 Marketplace Integration 으로 갈아끼움
- **multi-tenant SaaS** — siteUrl backfill 사용자 책임은 한 청첩장 한 사용자 가정 위. 한 사용자가 여러 청첩장 운영 시 누적 backfill 마찰 큼 → webhook 인프라 별도 ADR
- **본격 SaaS** — 우리 토큰 보유 + 자동화 전체 = 본 ADR 의 "데이터 보관 X" 정체성 폐기

ADR 007·008·009·010·011 의 도메인 적정 트레이드오프 패턴 일관 — 청첩장 도메인 특수성 + 외부 시스템 한계 모두를 OSS 템플릿 정체성으로 굳히는 누적 결정.

## 미래 트리거 (재검토 조건)

1. **Vercel OAuth 의 project create 권한 공개** — Vercel 측 정책 변경으로 user-to-server 토큰의 `POST /v1/projects` 가 공개되는 시점 → 결정 1 재검토. ADR 011 패턴 미러로 popup OAuth + postMessage 토큰 + project create 자동화. 사용자 backfill (결정 3) · Deploy Button (결정 5) 폐기 가능
2. **사용자 backfill 의 마찰이 5분 약속 깨는 발화** — 사용자 후기 "siteUrl 입력 깜빡함 → OG 깨짐" 누적 시 webhook 인프라 (대안 G) 도입 검토. ADR 010·011 의 "데이터 보관 X" 약속 양보가 trade-off
3. **Deploy Button URL spec 변경** — Vercel 의 query 파라미터 (env, envDescription 등) 의 deprecation 또는 신규 옵션 → URL 빌더 갱신
4. **Vercel for GitHub App 의존성 변경** — Vercel 이 GitHub 외 git provider (GitLab, Bitbucket) 만 권장하거나 GitHub App install 단계 변경 시 → Deploy Button 호출 패턴 재검토
5. **multi-tenant 시나리오 발화** — 한 사용자가 여러 청첩장 운영 (이벤트 기획자 등) 사례 보고 → backfill 누적 마찰 + Deploy Button 흐름 별도 운영 부담 → 본격 SaaS 별도 ADR (ADR 010 미래 트리거 4 정합)
6. **Vercel 외 PaaS (Netlify · Cloudflare Pages · Render) 지원 요청** — fork 사용자가 Vercel 외 호스팅 선호 시 본 ADR 의 Deploy Button 단일 의존 한계. 추상화 ADR 별도

## 관련

- **ADR**: ADR 010 (v2.0 editor 아키텍처) — 본 ADR 의 직접 부모. ADR 011 (GitHub OAuth) — 외부 시스템 통합 패턴 비교 (대조: GitHub App 깔끔한 패턴 vs Vercel 한계 수용). ADR 002 (config-driven approach) — siteUrl 이 config 의 단일 진입점 통과
- **회고**: `docs/retrospective/v1.1.x.md` 5절 (v2.0 SaaS-lite 옵션 3 채택), 8절 (Phase 4 = 2~3 호흡 추정), `docs/00-roadmap.md` Phase 4 섹션
- **신규 진입점** (Phase 4 호흡): `lib/editor/vercel-deploy-url.ts` (결정 1·2 — URL 빌더 pure function), `app/edit/_PublishToGithub.tsx` re-publish 모드 안의 "Vercel 에 배포" 섹션 추가 (결정 5)
- **신규 의존성**: 없음. URL 빌더는 표준 `URLSearchParams`. Vercel API 호출 없음 = SDK 의존성 0
- **사용자 직접 작업** (Phase 4 첫 호흡 prerequisite): 본 ADR 의 결정 1 채택 = 우리 측 OSS 운영자 작업 0. 사용자 측은 Deploy Button 클릭 후 Vercel 흐름 (계정 가입 + Vercel for GitHub install + env 입력) 자체가 Vercel UX 표준이라 별도 안내 최소
- **`.claude/rules/` 신규**: Phase 4 완료 후 `vercel-deploy.md` 분리 — Deploy Button URL spec + env prefill 패턴이 누적되면. 현 시점엔 본 ADR + ADR 011 의 `github-oauth.md` 후보와 묶음
