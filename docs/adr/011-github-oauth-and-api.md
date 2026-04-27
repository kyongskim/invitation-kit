# ADR 011 — GitHub OAuth + Contents API (App 종류 · repo 생성 방식 · 토큰 흐름 · config 직렬화)

- **Status**: Accepted (v2.0 Phase 3 진입 첫 결정)
- **Date**: 2026-04-26 (초안) · **2026-04-27 update — 결정 1 의 OAuth entrypoint 를 install + authorize 통합 URL 로 수정** (v2.0 검증 중 발견된 gap, 아래 "Update 2026-04-27" 절 참조)
- **Context**: ADR 010 의 v2.0 SaaS-lite 골격 — 사용자 본인 GitHub repo 에 fork + commit + Vercel 자동 배포 — 의 첫 외부 시스템 통합 단계가 GitHub. ADR 010 은 "토큰 client 메모리만, 우리 서버 영구 저장 X" 정체성과 "이미지/config 모두 GitHub Contents API PUT" 골격을 박았지만, 그 약속을 지키는 OAuth/API 구현 결정 4 가지 (App 종류 · repo 생성 방식 · callback 의 토큰 전달 메커니즘 · config 파일 직렬화 포맷) 는 보류했다. 본 ADR 이 4 결정을 한 번에 박아 Phase 3 의 2~3 호흡 (`app/api/github/oauth/`, `lib/editor/github-*.ts`, `lib/editor/serialize-config.ts`, editor 의 "GitHub 연결" UI) 구현 자유도를 좁힌다.

## 결정 (Accepted)

### 1. App 종류 — GitHub App (OAuth App 아님)

**GitHub App** 으로 등록한다. user identity 인증은 App 의 user-to-server OAuth 흐름 (`/login/oauth/authorize` 엔드포인트는 동일) 으로 받고, repo 작업은 user-to-server access token 으로 수행. **OAuth App · 사용자 PAT 복사붙임 모두 거부.**

선택 근거:

- **fine-grained permissions** — App 등록 시 `Contents: Read & write` · `Metadata: Read-only` · `Administration: Read & write` (template generate 용) 만 신청. OAuth App 의 `repo` scope 는 사용자의 모든 private repo 까지 포함하는 거대 권한 — v2.0 의 "데이터 보관 X" trust story 가 약속하는 최소 권한과 정합 안 됨
- **user-to-server token 1h TTL + auto-refresh** — App 토큰은 짧게 만료하고 refresh token 으로 갱신. 우리가 토큰을 메모리에만 둔다는 약속이 깨져 어딘가로 새도 시간 윈도우가 1h 로 제한됨. OAuth App 의 access token 은 사용자가 명시 revoke 할 때까지 영구 유효 = 새면 영구 유출
- **GitHub 의 공식 권고 방향** — 2026 시점 GitHub 은 OAuth App 신규 등록을 비권장 (deprecation 예고 아님이지만 docs 우선순위 강등). GitHub App 이 fine-grained PAT 와 함께 권장 경로
- **rate limit 5000/h (user-to-server)** — 청첩장 1 회 setup 의 commit 횟수 (config 1 + 이미지 9~20) 는 충분히 여유. App-to-server 의 더 높은 한도 (15000/h) 는 본 도메인엔 과잉

설치 흐름 (2026-04-27 update — install + authorize 통합):

```
사용자 → /edit 의 "GitHub 연결" 버튼
     → window.open('https://github.com/apps/<APP_SLUG>/installations/new?state=<csrf_nonce>')
     → GitHub 의 install 화면 (Repository access 선택) + Authorize 화면 한 흐름
     → 우리 callback (/api/github/oauth) 으로 redirect
       (?code=... &state=... &installation_id=... &setup_action=install)
     → callback 이 code → token 교환 (server-side, client_secret 사용)
     → callback 응답이 popup 안에서 window.opener.postMessage({token, user, expiresIn})
     → opener (/edit) 가 message 수신 → useEditorStore.setGithub({token, user})
     → popup window.close()
```

App 의 "Repository access" 설정은 **사용자 install 시점에 본인이 선택** (All repositories vs Only select repositories). v2.0 editor 는 "본인 선택" 권장 안내 + 선택 후 권한 부족 시 graceful 안내 ("이 repo 에 접근 권한이 없습니다. App 설정에서 추가하거나 다시 install 해주세요").

**Phase 3 첫 호흡 결과물** (사용자 직접 수행):

1. https://github.com/settings/apps/new 에서 GitHub App 등록
2. "Repository permissions" — `Contents: Read & write` + `Metadata: Read-only` + `Administration: Read & write`
3. "Where can this GitHub App be installed?" — "Any account" (OSS 템플릿 사용자가 본인 계정에 install 가능해야 함)
4. Callback URL: `https://invitation-kit.vercel.app/api/github/oauth` + 로컬 dev 용 `http://localhost:3000/api/github/oauth` 둘 다 (Add callback URL 버튼으로 줄 추가)
5. **Setup URL**: Callback URL 과 동일하게 (install 후 동일 handler 로 회귀)
6. **Request user authorization (OAuth) during installation**: ✅ ON (install + authorize 통합. OFF 면 신규 사용자가 user 토큰만 받고 install 누락 → template generate API 가 403 으로 실패. 2026-04-27 발견된 gap)
7. App 등록 후 노출되는 `App ID` · `Client ID` · `Client Secret` 그리고 App 의 public URL slug (예: `https://github.com/apps/invitation-kit-editor` → `invitation-kit-editor`) 를 Vercel env (Production·Preview 모두) + 로컬 `.env.local` 에 등록:
   - `NEXT_PUBLIC_GITHUB_APP_CLIENT_ID` (공개, OAuth code 교환 식별자용)
   - `GITHUB_APP_CLIENT_SECRET` (서버 전용, callback route 의 code 교환용. **`NEXT_PUBLIC_` 접두사 절대 금지**)
   - `NEXT_PUBLIC_GITHUB_APP_SLUG` (공개, install URL 생성용)

App 등록 자체는 우리 (OSS 운영자) 가 1 회 수행. 사용자 fork 는 본인 계정에 우리 App 을 install 하기만 함 — 추가 App 등록 부담 없음.

### 2. repo 생성 방식 — template generate (`POST /repos/{template}/generate`)

`POST https://api.github.com/repos/<owner>/invitation-kit/generate` 로 사용자 repo 를 생성한다. **fork 거부.** 우리 OSS 레포는 GitHub 설정에서 "Template repository" 토글을 켜둔다 (사용자 직접 작업 1 회).

선택 근거:

- **사용자 본인 repo 정체성** — fork 는 GitHub UI 에 "forked from invitation-kit/invitation-kit" 영구 표시 + 자동 repo 이름 = `<username>/invitation-kit`. 청첩장은 양가 부모님 실명·계좌번호·결혼식장 주소가 박힌 **개인 자산** — fork 표시는 약간의 노출감 + repo 이름 자유도 결여. template generate 는 깔끔한 신규 repo (`<username>/our-wedding-2027` 등 임의 이름)
- **commit history 깔끔함** — fork 는 우리 OSS 의 모든 commit history (현재 60+, v2.0 시점 100+ 추정) 를 그대로 carry over → 사용자 입장 noise. template generate 는 single initial commit 으로 squash → "내가 만든 청첩장" 의 첫 commit
- **upstream sync 가치 작음** — 청첩장 도메인은 "1 회 setup → 결혼식 후 archive". 사용자가 v2.x → v2.x+1 패치를 본인 repo 에 pull 받을 인센티브가 거의 없음 (= fork 의 장점이 활용 안 됨). v1.x → v2.0 같은 메이저 업그레이드 시도자는 어차피 새로 generate
- **Repository 이름 자유** — template generate API 는 `POST /repos/<template_owner>/<template_repo>/generate` body 의 `name` 필드로 신규 repo 이름 지정 가능. editor UI 가 사용자에게 input 노출 + 기본값 제안 (예: 신랑·신부 영문 이름 조합)

API 호출:

```ts
// 의사코드 — lib/editor/github-create-repo.ts
async function generateRepo(token: string, name: string, isPrivate: boolean) {
  const res = await fetch(
    "https://api.github.com/repos/invitation-kit/invitation-kit/generate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        owner: githubUser, // 사용자 username
        name, // 사용자가 정한 repo 이름
        description: `${groomName} ♥ ${brideName} 청첩장`,
        private: isPrivate, // editor UI 에서 사용자 선택, 기본값 false
        include_all_branches: false,
      }),
    },
  );
  if (!res.ok) throw new Error(`Repo generate failed: ${res.status}`);
  return res.json(); // { full_name, html_url, default_branch, ... }
}
```

**Private repo 경고**: private 으로 만들면 Vercel free tier 가 GitHub private repo 빌드를 막음 (Pro 필요). editor UI 가 "private 선택 시 Vercel Pro 필요" 안내 + 기본값 public 으로 둠.

**기존 동일 이름 repo 충돌**: API 가 `422 Validation Failed` 반환 → editor 가 사용자에게 "이미 같은 이름의 repo 가 있습니다. 다른 이름을 입력해주세요" 안내 + form 으로 복귀.

### 3. OAuth callback 의 토큰 전달 — popup + `postMessage` (cookie · query string · server-side store 거부)

`app/api/github/oauth/route.ts` 의 GET handler 가 `code` 를 받아 GitHub `/login/oauth/access_token` 와 server-side 교환 (client_secret 사용). 응답으로 **HTML 페이지** 를 렌더 — 그 페이지의 인라인 script 가 `window.opener.postMessage({token, user, expiresIn}, ourOrigin)` 후 `window.close()`. opener (`/edit`) 가 `window.addEventListener('message')` 로 수신 + origin 검증 + Zustand `github.token` 저장 (메모리만, ADR 010 의 partialize 약속 그대로).

선택 근거 — **거부된 4 대안과의 명시 비교**:

- **vs (i) HTTP-only cookie**: cookie 는 브라우저가 모든 동일 origin 요청에 자동 첨부 + Edge runtime 으로 우리 서버에서 읽힘. "메모리만, 서버 영구 저장 X" 약속 위반의 소지. 보안 측면에서는 cookie 가 표준 OAuth 패턴이지만 v2.0 정체성과 충돌
- **vs (ii) Redirect to `/edit?token=<jwt>` query string**: 토큰이 URL 에 박혀 (1) 브라우저 history 영구 보존, (2) Referer 헤더로 다음 페이지 외부 요청에 leak, (3) 서버 access log 에 그대로 남음 (Vercel · 사용자 측 분석 도구). OAuth 1.0 시절 안티패턴
- **vs (iii) URL fragment `/edit#token=<jwt>`**: history·Referer leak 은 회피하나 (fragment 는 서버 미전송) JS 가 직접 읽어야 함 + popup 닫힘 처리 별도 필요 + 새로고침 시 fragment 유실. postMessage 와 비교해 기술적 우위 없음
- **vs (v) Redis/KV 임시 store + client poll**: 우리 서버가 토큰을 일시적으로라도 저장 = "데이터 보관 X" 약속의 정신 위반. 운영 인프라 (Vercel KV 등) 1 개 추가 = SaaS-lite 정체성에서 SaaS 한 발 감

postMessage 의 제약 인지:

- **반드시 origin 검증** — `event.origin === window.location.origin` 가드. 임의 사이트가 우리 popup 에 message 보낼 수 있어서 검증 누락 시 토큰 탈취 벡터
- **popup blocker 회피** — 사용자 click 직접 trigger 로 `window.open` 호출 (이벤트 핸들러 동기 실행 컨텍스트). setTimeout / fetch 후 호출 시 block 됨
- **CSRF — `state` 파라미터 검증** — `crypto.randomUUID()` 로 nonce 생성 → `sessionStorage.setItem('github_oauth_state', nonce)` → OAuth URL 의 `state=<nonce>` → callback 의 응답 HTML 이 `state` 도 함께 postMessage → opener 가 sessionStorage 의 nonce 와 일치 검증

callback route 의 토큰 위생:

```ts
// 의사코드 — app/api/github/oauth/route.ts
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) return new Response("Missing params", { status: 400 });

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET, // 서버 전용
      code,
    }),
  });
  const { access_token, expires_in } = await tokenRes.json();

  // GitHub user info 동시 조회 (editor UI 표시용)
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { login } = await userRes.json();

  // 토큰을 절대 로깅·DB·KV 등 어디에도 저장 X. 즉시 HTML 응답에 인라인.
  return new Response(
    `<!DOCTYPE html><html><body><script>
       window.opener.postMessage(
         { token: ${JSON.stringify(access_token)},
           user: ${JSON.stringify(login)},
           expiresIn: ${expires_in},
           state: ${JSON.stringify(state)} },
         ${JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL)});
       window.close();
     </script></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
```

- **`access_token` 은 응답 HTML 의 인라인 JSON literal 외 어디에도 보관 X** — Vercel access log 의 path/query 에 박히지 않게 GET 의 query 는 `code` (재사용 불가, GitHub 단일 사용 후 무효) 만, 응답 body 는 stream-only HTML
- **응답 HTML 자체가 1회성** — opener 가 message 수신 직후 popup window.close() 로 휘발

**dev 환경 특수**: localhost 의 `http://localhost:3000` 은 위 (3-1) 번 절차에서 등록 — Phase 3 첫 호흡에서 사용자 자가 검증 가능. window.opener 는 popup 의 cross-origin 경계가 동일 GitHub.com 단일 호스트를 거쳐 와도 brittle 하지 않음 (OAuth redirect 패턴이 모든 브라우저에서 표준 지원).

### 4. config TS 직렬화 — 단일 파일 전체 재생성 (`invitation.config.ts` 1 파일)

editor 가 commit 할 `invitation.config.ts` 는 **deterministic 전체 재생성** — 서두의 `import type` 줄과 `export const config: InvitationConfig = {...}` 블록 전체를 매번 새로 만들어 `prettier.format(generated, { parser: 'typescript' })` 로 안정 diff. **JSON 파일 split 거부 · 부분 패치 거부.**

선택 근거:

- **ADR 002 의 "단일 진입점" 약속 유지** — `invitation.config.ts` 가 사용자 시점 단일 진입점. JSON 파일 split (예: `invitation.config.data.json` 분리) 은 v1.x 사용자 (직접 TS 편집) 의 익숙한 구조를 깨고, "Config 파일 하나만 수정" CLAUDE.md WHY 카피와 충돌. v2.0 editor 사용자도 "내 청첩장 정의는 이 파일 1 개" 로 인식 (debug · git diff · 수동 재편집 시점 모두)
- **type 정의는 별도 파일 분리 (`invitation.config.types.ts` 신규)** — 직렬화 단순화. 현재 `invitation.config.ts` 가 type 과 데이터 한 파일 = 재생성 시 type 까지 다시 짜야 하는 부담. type 을 별도 파일로 분리하면 데이터 파일은 `import type { InvitationConfig } from './invitation.config.types'` 한 줄 + `export const config: InvitationConfig = {...}` 한 블록 = 재생성 단순. **이 분리는 Phase 3 첫 호흡의 prerequisite 마이그레이션** (1 commit, 기존 코드 import 경로 zero impact — `invitation.config.ts` 가 type 을 re-export 하면 됨)
- **Contents API PUT 의 file 전체 교체 의미와 정합** — GitHub Contents API 는 부분 패치 없음 (전체 file 교체만). 우리도 전체 재생성으로 단순. user-edited TS 의 부분 patch 시도는 (TS AST 파싱 + node 단위 수정 + serialize back) 복잡도 폭증
- **prettier 마지막 패스로 사용자 git diff 안정** — editor 가 만든 raw string 은 quote 종류·trailing comma·indent 등 미묘한 차이로 매 commit diff 가 noise. `prettier.format()` 한 번 통과시키면 사용자 본인 prettier 설정 (현 프로젝트 기본 = single quote · 80 cols · semi · trailing-comma all) 과 정합 → 사용자가 본인 repo 의 git diff 에서 의미 변화만 보임

직렬화 의사코드:

```ts
// 의사코드 — lib/editor/serialize-config.ts
import { format } from "prettier";
import type { InvitationConfig } from "@/invitation.config.types";

export async function serializeConfig(
  config: InvitationConfig,
): Promise<string> {
  const body = `// 이 파일은 v2.0 editor 가 생성·관리합니다.
// 수동 편집도 가능하나 editor 에서 다시 저장 시 덮어써집니다.
// editor 가 다루지 않는 schema 확장이 필요하면 v1.x 직접 편집 모드로.

import type { InvitationConfig } from './invitation.config.types';

export type { InvitationConfig } from './invitation.config.types';

export const config: InvitationConfig = ${JSON.stringify(config, null, 2)};
`;
  return format(body, { parser: "typescript" });
}
```

- **`JSON.stringify` 의 한계**: `Date` 객체는 ISO 문자열로 직렬화. config schema 의 `Date` 필드 (예: `meta.date`) 는 editor store 시점에 이미 문자열 (form 입력) 또는 ISO 문자열로 정규화 — 별도 reviver 불필요. `undefined` 필드는 자동 제거 (config 가 정의 안 한 optional 필드는 그냥 빠짐)
- **함수·심볼·circular reference 등은 config schema 에 원래 없음** — `invitation.config.ts` 가 데이터-only 객체 정의로 유지되는 한 안전. editor 가 함수 필드를 만들 일 없음 (UI 가 form 컨트롤만)
- **사용자 코멘트 보존 안 함** — v1.x TS 편집 사용자가 파일에 추가한 코멘트는 editor 통과 시 사라짐. trade-off 수용 — v2.0 editor 모드와 v1.x 수동 편집 모드는 사용자가 의식적으로 선택. README + CONTRIBUTING 에 "editor 사용 시 수동 코멘트 사라짐" 명시 권장

prettier 의 dependency 비용:

- 현재 `prettier` 가 dev dependency. editor 가 client (브라우저) 에서 직렬화 호출 시 prettier 를 client bundle 에 포함하면 ~500KB+ 부담. **두 옵션**:
  1. **client-side prettier** — `prettier/standalone` + `prettier/plugins/typescript` dynamic import (사용자가 "GitHub 에 저장" 클릭 시점에만 로드). 청첩장 번들엔 영향 0
  2. **server-side prettier** — `app/api/github/commit/route.ts` route handler 에서 직렬화 + prettier + Contents API PUT 한 번에. client 는 config object 만 보내면 됨. 토큰은 Authorization 헤더로 (서버 비저장)
- **Phase 3 결정**: 옵션 2 (server-side) 채택. client bundle 영향 0 + commit endpoint 가 토큰 transit-only (저장 X) 라 ADR 010 약속 위반 아님. 단, 토큰을 우리 서버에 보낸다는 사실은 "서버가 토큰 보지 않음" → "서버가 토큰을 transit 으로 받지만 즉시 GitHub API 에 forward 후 메모리 휘발" 로 약속 정확화 — Phase 3 호흡 commit 메시지 + 향후 README "보안 모델" 섹션에 명시

## 거부 대안

### 결정 1 (App 종류)

#### A. OAuth App + `public_repo` scope

거부. token 영구 유효 (revoke 전까지) + scope 가 "사용자의 모든 public repo 쓰기" 로 fine-grained 결여 = ADR 010 의 "데이터 보관 X" trust story 가 약속하는 최소 권한과 정합 안 됨. GitHub 의 2026 시점 권장 방향과도 반대. 마이그레이션 (OAuth App → GitHub App) 은 사용자별 재인증 부담 누적이라 **시작부터 GitHub App** 이 단순.

#### B. PAT (Personal Access Token) 복사붙임

거부. 사용자가 https://github.com/settings/tokens 에서 fine-grained PAT 발급 → 권한 선택 → 토큰 복사 → editor 의 input 에 붙여넣기 = **5 단계 수동 작업**. 비개발자 5분 배포 약속 위반. PAT 만료·재발급 시 같은 단계 반복. OAuth 흐름의 1 클릭 대비 비교 우위 없음. 단, GitHub App 이 어떤 이유로든 사용자 install 거부 시 graceful fallback 으로 PAT 입력 옵션은 v2.0+ 후보 (현 ADR 스코프 밖)

#### C. Device flow (`POST /login/device/code`)

거부. callback URL 불필요한 OAuth 변형이지만 사용자가 (1) editor 에서 시작 → (2) 브라우저 새 탭에서 https://github.com/login/device 방문 → (3) 화면의 8 자리 코드 입력 → (4) editor 로 복귀 = 4 단계 + 탭 전환 부담. popup OAuth 의 1 클릭 대비 마찰 큼. CLI · 데스크톱 앱 등 callback URL 등록 불가능한 환경 대상 패턴이라 우리 웹 환경엔 부적합

### 결정 2 (repo 생성 방식)

#### D. fork (`POST /repos/{template}/forks`)

거부. (1) repo 이름 고정 (`<username>/invitation-kit`) → 사용자 본인 repo 정체성 약화 (한 사용자가 여러 청첩장 만들 시 충돌도), (2) "forked from invitation-kit/invitation-kit" 영구 표시 → 개인 자산 (계좌·실명·결혼식장) 의 OSS 출처 노출감, (3) 우리 OSS 의 100+ commit history 그대로 carry over → noise. upstream sync 가 청첩장 도메인 (1 회 setup → archive) 에서 가치 작음. **다른 도메인 fork** (커뮤니티 게시판, 콘퍼런스 invitation 의 매년 재사용) 시엔 fork 가 합리적이지만 청첩장 도메인 가정 밖

#### E. 사용자 직접 repo 생성 + editor 가 빈 repo 에 commit

거부. 사용자가 https://github.com/new 에서 repo 만들기 → editor 에 repo URL 입력 → 우리가 첫 commit (template 파일 일괄 PUT) = 비개발자 입장 추가 단계. template generate API 가 동일 결과 (신규 repo + template 파일) 를 1 호출로 끝냄. editor 자체가 GitHub repo 를 만들 수 있다는 능력 자체가 SaaS-lite 의 가치 제안 중 하나

#### F. GitHub Org 소유 단일 repo 의 branch per user

거부. 우리 (운영자) 가 단일 repo 를 들고 사용자별로 branch 를 만드는 모델 = "사용자 본인 repo 에 코드 생성, 우리는 데이터 보관 X" 정체성 정면 위반. 사용자 데이터가 우리 repo 에 누적 + 우리가 영구 호스팅 부담 = 본격 SaaS 모델 (회고 옵션 4) 진입. v2.0 SaaS-lite 스코프 밖

### 결정 3 (OAuth callback 토큰 전달)

위 "선택 근거 — 거부된 4 대안과의 명시 비교" 절에 (i) cookie · (ii) query string · (iii) URL fragment · (v) server-side store 거부 근거 박음. 추가 대안:

#### G. SSE (Server-Sent Events) + 임시 채널

거부. callback route 가 token 을 임시 메모리에 두고 client 가 SSE 로 폴링 = 우리 서버에 잠시라도 token 보관 (memory) + 임시 채널 ID 관리 부담 + Vercel serverless 의 stateless 가정과 충돌. postMessage 가 같은 결과를 서버 무상태로 달성

### 결정 4 (config 직렬화)

#### H. JSON 파일 split (`invitation.config.data.json`)

거부. 직렬화 자체는 더 단순 (`JSON.stringify(config, null, 2)` 만) 하나 (1) ADR 002 의 "단일 진입점" 약속 깨짐, (2) v1.x 사용자 (TS 직접 편집) 의 익숙한 구조 변경, (3) `invitation.config.ts` 가 JSON 을 import 하는 thin wrapper 가 됨 = 사용자가 두 파일을 동시에 봐야 하는 인지 부담. JSON 의 type 검증 시점이 빌드 타임이 아닌 런타임으로 후퇴 — TS 의 type 안전성 일부 손실

#### I. AST 기반 부분 패치 (ts-morph 등)

거부. user-edited TS 의 코멘트·custom 헬퍼·import 등을 보존하면서 `config = {...}` 블록만 patch = 라이브러리 의존성 큰 (ts-morph ~10MB), 복잡도 높음, edge case 많음 (중첩 객체 패치, 타입 단언 보존, 주석 위치 등). 청첩장 도메인 form-driven editor 에 과잉. 사용자 custom 코드 보존이 정말 필요해지면 별도 ADR

#### J. delimited 마커 패턴 (`// EDITOR-MANAGED: BEGIN ... END`)

거부. 마커 사이만 재생성하는 절충안. 사용자 코멘트 일부 보존 가능하나 마커 내부 세부 (코멘트 보존 위치, 마커 자체 사용자 실수 삭제 시 복구 불가, prettier 가 마커 옮길 가능성) 가 운영 부담. 단순 전체 재생성 + "editor 모드는 코멘트 사라짐" 명시 약속이 트레이드오프 명확

## 청첩장 도메인 적정 맥락

본 4 결정 묶음은 ADR 010 의 도메인 가정 (1 회 setup · 사진 9~20장 · 한 번 setup 후 결혼식 후 archive) 위에 GitHub 통합 결정 4 가지를 정합. 핵심 정합 축:

- **GitHub App 의 fine-grained + 1h TTL** — 청첩장 setup 은 단발 작업 (~10~30 분 한 세션) → 1h TTL 안에 끝남. 장기 자동화 (CI bot 등) 불필요
- **template generate 의 squashed history** — "이번 결혼식의 첫 commit" 정체성. 사용자 개인 자산 repo 의 본질에 맞음
- **postMessage popup OAuth** — 단발 setup 1 회 흐름엔 "popup 한 번 떴다가 닫힘" UX 가 자연. 장기 세션 (편집 ↔ 미리보기 반복) 환경엔 cookie 가 더 자연이지만 본 도메인 아님
- **단일 TS 파일 재생성** — config 1 개 = 청첩장 1 개의 전체 정의. 다중 환경 (dev/staging/prod) 분기 같은 복잡도 부재

**다른 도메인 fork 시 부적합 명시**:

- **콘퍼런스 / 이벤트 invitation (매년 재사용 + 다수 호스트 + 사진 빈번 교체)** → fork (대안 D) 가 매년 upstream 새 기능 받기에 합리적, OAuth App scope 도 다중 repo 관리에 적정. config 도 schema 진화 빈도 높아 JSON split (대안 H) 또는 schema versioning 별도 도입 검토
- **본격 SaaS (회원가입 + DB + multi-tenant)** → 본 ADR 의 client memory token 전체 폐기. 서버 측 secure session + DB 저장 토큰 + refresh 자동화로 갈아끼움. 별도 ADR 필수
- **CLI / 데스크톱 도구** → popup OAuth (결정 3) 부적합 → device flow (대안 C) 가 합리적

ADR 007 (방명록 본인 삭제 C') · ADR 008 (RSVP read 차단) · ADR 009 (App Check) · ADR 010 (v2.0 editor 아키텍처) 의 도메인 적정 트레이드오프 패턴 일관 — 청첩장 도메인 특수성을 OSS 템플릿 정체성으로 굳히는 누적 결정. 본 ADR 이 v2.0 의 외부 시스템 통합 첫 결정으로, 후속 ADR 012 (Vercel API + 환경변수 등록 — Phase 4 진입 시) 가 같은 정합 축 위에서 결정될 토대.

## 미래 트리거 (재검토 조건)

1. **GitHub App install 의 사용자 마찰이 비개발자 진입 30%+ 이탈로 발화** — editor 진입 → "GitHub 연결" 클릭 후 install 화면에서 cancel 율이 높으면 PAT 입력 fallback (대안 B) 또는 device flow (대안 C) 도입 검토. 측정은 v2.0 출시 후 사용자 후기 + (가능하면) Vercel Analytics
2. **template generate 가 어떤 이유로든 deprecated · 권한 변경** — GitHub 정책 변경 시 fork (대안 D) 로 fallback. config 직렬화는 영향 없음
3. **client memory 토큰 모델이 사용자 "왜 새로고침하면 다시 GitHub 연결?" 마찰로 발화** — 짧은 setup 1 회 가정이 깨지고 사용자가 며칠 걸쳐 편집한다면 (1) sessionStorage 토큰 (탭 단위 영속) 또는 (2) HTTP-only cookie (보안 모델 양보) 검토. 후자는 ADR 010 정체성 양보라 별도 ADR 필요
4. **config schema 가 함수 · circular reference · Map 등 JSON.stringify 한계 필드 도입** — 현재 schema 가 데이터-only 라 안전. theme override 함수 같은 확장이 들어오면 직렬화 전략 재설계 (AST 또는 JSON split + 별도 함수 파일 분리)
5. **GitHub Apps API 의 메이저 버전 변경** — `X-GitHub-Api-Version: 2022-11-28` pin. 우리가 의존하는 endpoints (`/login/oauth/access_token`, `/user`, `/repos/.../generate`, `/repos/.../contents/*`) 의 breaking change 시 본 ADR 의 호출 의사코드 갱신
6. **prettier 의존성 자체가 commit endpoint 의 cold start 부담** — Vercel serverless 의 cold start 에서 prettier import 가 느리면 (~수백 ms) lazy import 또는 직렬화 단순화 (template literal 만, prettier 없이) 검토. trade-off: diff 안정성 일부 양보

## Update 2026-04-27 — Install + Authorize 통합 entrypoint

**발견 경위**: v2.0 Phase 4-a closure 후 production 검증 (시크릿 창 + 신규 GitHub 계정) 중에 Connect GitHub 까지는 통과했으나 Publish to GitHub 가 `403 "Resource not accessible by integration"` 으로 실패. 신규 사용자 시나리오에서 재현 가능한 첫 발화.

**원인**: 결정 1 의 초안 흐름이 `https://github.com/login/oauth/authorize?...` 만 호출 — 이는 **user-to-server OAuth authorize 단계만** 처리. GitHub App 의 권한 분리 모델에서 user authorize 와 install 은 별개 grant 라, install 이 누락된 user 토큰은 본인 프로필 읽기는 가능해도 `Administration: Write` 가 필요한 template generate 호출은 불가. 신규 사용자는 install 단계 자체가 필요하므로 OAuth-only entrypoint 는 정의 불완전.

**해결 (결정 1 수정)**: install URL `https://github.com/apps/<slug>/installations/new?state=...` 를 entrypoint 로 사용 + App 설정의 `Request user authorization (OAuth) during installation` ON 으로 install + authorize 를 한 사용자 흐름에 통합. 같은 callback 으로 `code` + `state` + `installation_id` + `setup_action` 가 같이 돌아오므로 token 교환 로직은 동일. 신규 env `NEXT_PUBLIC_GITHUB_APP_SLUG` 도입.

**왜 초안에서 놓쳤나**: 초안 작성 시점 (2026-04-26) 의 dev 환경 검증은 작성자 본인 GitHub 계정 — 이미 install 된 상태여서 OAuth authorize 단독 흐름으로도 token 이 install scope 를 carry over. 신규 사용자 페르소나로 검증하지 않으면 발견 불가능한 path. v2.0 의 비개발자 5분 배포 약속은 정확히 신규 사용자 시나리오 — 이걸 생산 시점에 검증한 자체가 ADR 의 첫 효용.

**변경 영향**:

- `_GithubConnect.tsx` — `handleConnect` 의 URL 패턴 변경 + `appSlug` env 가드 추가
- `app/api/github/oauth/route.ts` — 변경 없음 (callback 의 `code` + `state` 처리는 동일). 흐름 주석만 install + authorize 통합 반영
- `.env.example` — `NEXT_PUBLIC_GITHUB_APP_SLUG` 신규 줄 + Setup URL · "Request user authorization during installation" 토글 안내 추가
- 사용자 직접 작업: App 설정의 Setup URL 추가 + 토글 ON + Vercel env 에 `NEXT_PUBLIC_GITHUB_APP_SLUG` 등록 + 재배포

**거부 대안 (Update 시점에 한 번 더 명시)**:

- **두 단계 흐름 (`/login/oauth/authorize` → editor 가 install API 체크 → 별도 install URL redirect)**: 사용자 1 흐름이 2 흐름이 됨. install 단계의 cancel 가능성 늘어남. install + authorize 통합이 GitHub 의 공식 권장 패턴
- **install only (`/apps/<slug>/installations/new`) + authorize 분리**: 토큰 못 받음. user 신원 (login) 모름. editor 가 어느 user 의 어느 repo 에 commit 할지 결정 불가
- **GitHub App user identity 없이 installation token 만 사용**: GitHub App-to-server token 은 specific repo 에 한정 + user 입력 (repo 이름) 시점엔 repo 가 아직 없음 (template generate 전). 흐름 자체 불가능

**도메인 적정 트레이드오프 (변함 없음)**: install 화면이 한 번 더 떠서 사용자 클릭 1 회 추가 — 비개발자 진입 마찰의 원천이라기엔 GitHub UI 가 익숙한 형태 (다른 OSS 도구 install 시 동일 화면). 본 update 가 진짜 막혀있던 흐름 (template generate 403) 을 푸는 효용이 압도적.

## 관련

- **ADR**: ADR 010 (v2.0 editor 아키텍처) — 본 ADR 의 직접 부모. ADR 002 (config-driven approach) — 결정 4 의 "단일 진입점" 약속 출처. ADR 007/008/009 — 도메인 적정 트레이드오프 패턴 선례. ADR 012 — Phase 4 의 Vercel Deploy Button 위임 (본 update 와 같은 v2.0 검증 호흡)
- **회고**: `docs/retrospective/v1.1.x.md` 5절 (v2.0 SaaS-lite 옵션 3 채택), 8절 (호흡 분량 추정 — Phase 3 = 2~3 호흡), `docs/00-roadmap.md` Phase 3 섹션
- **신규 진입점** (Phase 3 호흡): `app/api/github/oauth/route.ts` (결정 1·3), `app/api/github/commit/route.ts` (결정 4 server-side prettier), `lib/editor/github-create-repo.ts` (결정 2), `lib/editor/github-upload.ts` (ADR 010 결정 2 이미지 commit), `lib/editor/serialize-config.ts` (결정 4), `invitation.config.types.ts` (결정 4 prerequisite 분리)
- **새 의존성**: 없음. `prettier` 는 dev dep 이미 있음 (lazy import 로 server-side 사용). Octokit (`@octokit/rest`) 도입은 보류 — fetch + 명시 endpoint 4 개로 충분, Octokit 의 추상화 가치가 작음. Phase 3 진행 중 호출 endpoint 가 10+ 로 늘면 재검토
- **사용자 직접 작업** (Phase 3 첫 호흡 prerequisite, 2026-04-27 update 반영):
  1. https://github.com/settings/apps/new 에서 GitHub App 등록 (결정 1 의 4 단계)
  2. App General 탭의 **Setup URL** 을 Callback URL 과 동일하게 + **Request user authorization (OAuth) during installation** ✅ ON
  3. 우리 OSS repo 의 Settings > General > "Template repository" 토글 ON (결정 2 의 prerequisite)
  4. Vercel env (`NEXT_PUBLIC_GITHUB_APP_CLIENT_ID` · `GITHUB_APP_CLIENT_SECRET` · `NEXT_PUBLIC_GITHUB_APP_SLUG` · `NEXT_PUBLIC_SITE_URL`) Production·Preview 등록 + 재배포 (firebase.md 의 Vercel env 등록 절차 동일)
- **`.claude/rules/` 신규**: Phase 3 완료 후 `github-oauth.md` (또는 `editor.md` 통합) 분리 — App 등록·token 흐름·rate limit·error 패턴이 누적된 규칙성 발화 시점. ADR 010 의 "Phase 5 결정" 을 본 ADR 시점에 더 이른 발화 가능성으로 갱신
