# ADR 010 — v2.0 editor 아키텍처 (편집기 위치 · 이미지 처리 · state 관리)

- **Status**: Accepted (v2.0 Phase 1, 첫 호흡)
- **Date**: 2026-04-26
- **Context**: v1.1.x closure → v2.0 SaaS-lite 진입 (회고 `v1.1.x.md` 5절 옵션 3 채택). form 입력 → `invitation.config.ts` 자동 생성 → 사용자 본인 GitHub repo fork + commit → Vercel API 자동 배포가 v2.0 의 골격. **우리 인프라 0, 데이터 보관 X, GitHub 토큰은 OAuth callback 동안만 client 메모리** — 이게 v1.x 의 client-only 정체성을 깨지 않는 자동화 확장의 조건. 본 ADR 은 v2.0 editor 의 아키텍처 기반 3 결정을 한 번에 박아 후속 호흡 (Phase 2~5) 의 구현 자유도를 좁힌다.

## 결정 (Accepted)

### 1. editor 위치 — 같은 repo `app/edit/`

editor 는 청첩장 템플릿과 동일 repo 의 `app/edit/` 라우트로 호스팅한다. 청첩장 사용자가 fork 하는 시점에 editor 코드도 함께 따라오고, 공식 호스트 (`invitation-kit.vercel.app/edit`) 에서 동일 코드가 무계정 사용자도 form 만 채워볼 수 있게 한다.

```
app/
  page.tsx                    # 청첩장 (기존)
  layout.tsx                  # 기존
  edit/
    page.tsx                  # editor (신규, 'use client' boundary)
    layout.tsx                # editor 전용 layout (preview pane 등)
    sections/                 # form 컨트롤 (Main/Greeting/Gallery ...)
    preview/                  # live preview (청첩장 컴포넌트 재사용)
  api/
    github/                   # Phase 3 — OAuth callback + repo create + commit
    vercel/                   # Phase 4 — project create + deploy
lib/
  editor/                     # store, schema bridge, validators
```

editor 는 **`invitation.config.ts` 의 schema 를 직접 import** 해 form 컨트롤·기본값·validator 를 한 곳에서 끌어온다. live preview 는 청첩장 섹션 컴포넌트 (`components/sections/*`) 를 그대로 렌더 — store 가 만든 config object 를 props 로 주입. 청첩장 번들 영향은 **Next.js 라우트 단위 코드 splitting** + editor 전용 의존성 (zustand 등) 의 dynamic import 로 격리.

### 2. 이미지 처리 — GitHub commit (Contents API)

사용자가 form 에서 이미지를 업로드하면, Phase 3 OAuth 로 발급된 GitHub 토큰으로 사용자 fork repo 의 `public/images/gallery/` 에 직접 commit. **추가 SaaS 가입 0 건**, 이미지 자산 소유권 100% 사용자, Vercel push trigger 로 자동 재배포까지 한 흐름.

```ts
// 의사코드 — lib/editor/github-upload.ts
async function uploadImage(file: File, path: string, token: string) {
  const base64 = await fileToBase64(file);
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        message: `chore: upload ${path}`,
        content: base64,
        branch: "main",
      }),
    },
  );
  return `/${path}`; // config.gallery.photos[].src 로 그대로 사용
}
```

- **저장 경로 규약**: `public/images/gallery/{nanoid}.{ext}` — 파일명 충돌 방지 + Next.js `<Image>` 가 그대로 처리.
- **사이즈 가드**: client 단 5MB 상한 + 자동 resize (max 1920px, JPEG quality 80%) 후 업로드. Phase 5 에서 `lib/editor/image-resize.ts` 분리.
- **rate limit**: GitHub API authenticated 5000/h — 갤러리 9~20장 + config commit 은 충분히 여유.
- **무계정 demo 모드**: editor 가 GitHub 미연결 상태에서도 form + preview 는 동작. 이미지는 ObjectURL 로 임시 미리보기만, 실제 업로드는 OAuth 후.

### 3. state 관리 — Zustand + persist middleware

```ts
// 의사코드 — lib/editor/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InvitationConfig } from "@/invitation.config";

type EditorState = {
  config: InvitationConfig;
  github: { token: string | null; user: string | null }; // 메모리만
  setField: <K extends keyof InvitationConfig>(
    key: K,
    value: InvitationConfig[K],
  ) => void;
  reset: () => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      github: { token: null, user: null },
      setField: (key, value) =>
        set((state) => ({ config: { ...state.config, [key]: value } })),
      reset: () => set({ config: defaultConfig }),
    }),
    {
      name: "invitation-kit-editor",
      partialize: (state) => ({ config: state.config }), // GitHub 토큰은 persist X
    },
  ),
);
```

- **persist middleware = "초안 저장" UX 무료** — 사용자가 form 작성 중 새로고침해도 localStorage 에서 복원.
- **`partialize` 로 토큰 제외** — `github.token` 은 메모리만, localStorage·sessionStorage·쿠키 어디에도 저장 안 함. v2.0 정체성 ("우리는 데이터 보관 X") 의 client 단 미러.
- **selective subscription** — form section 별 `useEditorStore((s) => s.config.gallery)` 식으로 구독해 다른 섹션 입력 시 불필요한 re-render 차단. live preview 는 `s.config` 전체 구독.
- **`/edit` 라우트에서만 import** — 청첩장 번들에 zustand 안 들어감 (Next.js route-level code splitting).

## 거부 대안

### 결정 1 (editor 위치)

#### A. 별도 repo `invitation-kit-editor`

거부. **양쪽 sync 비용** 이 본 결정의 발목 — 청첩장 테마 토큰 추가, config schema 필드 추가, 컴포넌트 변경마다 editor repo 도 동기 업데이트 + 버전 lock 관리. 비개발자 사용자 입장에서 "fork 할 repo 가 2 개" 되면 SaaS-lite 의 5분 약속 깨짐. live preview 가 청첩장 컴포넌트를 cross-package import 하려면 npm publish (또는 git submodule) 단계 추가 = 라이프사이클 분리의 장점이 비용에 묻힘. editor 만의 의존성 격리는 라우트 단위 splitting 으로 충분.

#### B. editor 만 별도 Vercel 프로젝트, 코드는 같은 repo

거부. 단일 repo 의 `vercel.json` 2 개 프로젝트 분기는 가능하지만, 사용자 fork 시 본인 Vercel 에 editor 가 따라가는 흐름 (= 본인 도메인의 `/edit` 으로 본인이 편집) 이 끊김. 공식 호스트만 editor 를 운영하는 모델은 "사용자 본인 GitHub 에 코드 생성, 우리는 데이터 보관 X" 정체성과는 정합하지만, 사용자가 청첩장 배포 후 수정하려면 다시 공식 호스트로 돌아와야 함 = "본인 인프라 자급자족" 약점. Phase 5 에서 사용자 운영 vs 공식 호스트 데모 둘 다 같은 코드로 가능하게 두는 게 단순.

### 결정 2 (이미지 처리)

#### C. 외부 URL only (사용자가 Imgur/Cloudinary 등에 직접 host)

거부. v1.x 의 "이미지 URL 직접 입력" 과 동일 = v2.0 SaaS-lite 의 의의 약화. 비개발자가 form 안에서 "이미지 URL" 필드 마주치는 순간 "Imgur 가서 업로드 → 링크 복사 → 붙여넣기" 가 필요 = GitHub/Vercel 계정만으로 끝나는 흐름이 깨짐. v2.0 의 비개발자 진입 마찰 90% 해소 가설이 위 한 단계 추가로 50% 수준으로 떨어짐.

#### D. Cloudinary 통합

거부. 이미지 자동 최적화·responsive·lazy delivery 등 기능 매력은 충분하나 **추가 SaaS 가입** 이 SaaS-lite 정체성에 충돌. 사용자가 ① Cloudinary 가입 ② API key 발급 ③ Vercel env 등록 → "GitHub/Vercel 만" 약속에 SaaS 1 개 추가. 이미지 최적화는 Next.js `<Image>` + Vercel Image Optimization (자동) 으로도 청첩장 도메인 (~9~20장, 갤러리 한 번 setup) 에 충분. **다른 도메인 fork** (이벤트 invitation, 콘퍼런스 RSVP, 사진 빈번 교체) 시 Cloudinary 가 합리적이지만 그건 본 도메인 적정 가정 밖.

#### E. Vercel Blob Storage / S3 Direct Upload

거부. Vercel Blob 은 Hobby 무료 티어 (1GB) 에 청첩장 도메인 충분히 들어가지만 사용자별로 Vercel 프로젝트가 따로 생기는 SaaS-lite 모델에서 **각 사용자의 Vercel 프로젝트에 Blob storage 활성화 단계가 추가** = 5분 약속 위반. S3 는 Cloudinary 대비 더 큰 setup 마찰 (IAM, bucket policy, CORS).

### 결정 3 (state 관리)

#### F. React `useState` / `useReducer` + prop drilling

거부. editor sections 가 8~10 개 (Main · Greeting · Gallery · Venue · Accounts · RSVP · Guestbook · Share · Theme · Meta) 로 분리되고 live preview 가 같은 state 를 동시 구독하면 **prop drilling 깊이 4~5 단** 이 거의 보장. 게다가 localStorage persist 를 직접 구현 (useEffect + JSON.stringify + 마이그레이션 로직) 하는 것은 zustand persist middleware 대비 **첫 호흡 분량 1~2 호흡 추가**. 단순 form 1 개라면 이 대안이 합리적이지만 editor 스코프엔 못 미침.

#### G. React Context + `useReducer`

거부. prop drilling 은 해소하나 **광범위 re-render 부담**. config 의 임의 필드 변경이 모든 consumer 를 invalidate → form 컨트롤 100+ 개가 동시에 re-render. selective subscription 을 직접 구현 (Context 분할 + memoization 다층) 하면 zustand 가 기본 제공하는 동작을 손으로 짜는 셈. persist 도 별도 구현 부담.

#### H. Jotai (atoms)

거부. atom 단위 selective subscription 은 매력 있으나 **config tree 가 nested object** 라 atom 분해 (`gallery.photos[3].src` 같은 lens) 가 복잡. zustand 의 단일 store + selector 함수 모델이 이 구조에 더 단순. persist atom 도 atom 단위 직렬화 정책이 분산돼 partialize (토큰 제외) 같은 경계 처리에 추가 코드.

#### I. Redux Toolkit

거부. action / reducer / slice 보일러플레이트 + RTK Query 같은 큰 표면적이 editor 단일 도메인 스코프엔 과함. dev tools · time-travel debugging 의 수혜 영역도 form-driven editor 에선 작음. zustand devtools middleware 가 같은 부분의 80% 를 더 적은 비용으로 커버.

## 청첩장 도메인 적정 맥락

본 3 결정 묶음은 **결혼식 1 회 사용 + 사진 9~20장 + 한 번 setup + 결혼식 후 archive** 의 도메인 가정에 정합. 핵심 정합 축:

- **GitHub commit 이미지** — 사진 빈번 교체가 없는 도메인 (= repo binary 누적이 끝없이 자라지 않음)
- **공식 + 사용자 자급자족 같은 코드** — 청첩장은 한 커플에 하나라 "여러 청첩장을 한 계정에서 관리" 시나리오가 거의 없음 (multi-tenant 가설 부재)
- **Zustand persist** — 한 번 setup 후 archive 라 마이그레이션 (스키마 변경 시 localStorage migration) 부담이 작음

**다른 도메인 fork 시 부적합 명시**:

- 콘퍼런스 / 이벤트 invitation (사진 빈번 교체, 다수 호스트, 매년 재사용) → GitHub commit 이미지가 binary 누적 + 매년 fork 흐름이 청첩장 모델과 다름. Cloudinary 또는 Vercel Blob 으로 갈아끼우는 명시 권고가 README/CONTRIBUTING 에 들어감
- 본격 SaaS (회원가입 + DB + 결제) → 본 ADR 의 client-only 모델 전체 폐기. 별도 ADR 필요

ADR 007 (방명록 본인 삭제 C') · ADR 008 (RSVP read 차단) · ADR 009 (App Check) 의 도메인 적정 트레이드오프 패턴 일관 — 청첩장 도메인 특수성을 OSS 템플릿 정체성으로 굳히는 누적 결정.

## 미래 트리거 (재검토 조건)

1. **editor 가 청첩장 번들 영향 측정 가능한 회귀** — Lighthouse Performance / FCP / Bundle size 에서 editor 도입 전후 회귀 발견 시. 라우트 단위 splitting 이 부족하면 별도 repo 분리 (대안 A) 또는 build-time conditional 도입 검토. v1.1.x 회고의 Lighthouse 78 점 사이클 유지 기준
2. **사용자 fork repo 의 binary 누적이 운영 부담** — 100MB+ 누적 또는 사진 교체 빈도 가정 깨짐 → Cloudinary 옵트인 도입 (대안 D) + 사용자 setup 마찰 수용
3. **Zustand persist 가 large config 직렬화 / 마이그레이션 부담 발화** — config schema breaking change 시 localStorage 의 stale 초안 복원 실패 사례 누적 → IndexedDB 어댑터 swap 또는 persist 폐기 + 명시 "초안 저장" 버튼 모델
4. **multi-tenant 시나리오 발화** — 한 사용자가 여러 청첩장 운영 (이벤트 기획자, 결혼식 대행 업체) 사례 보고 → 본격 SaaS (회고 옵션 4) 진입 ADR 별도. 본 ADR 의 client-only 가정 폐기
5. **GitHub OAuth 정책 변경** — GitHub App 정책으로 token scope 가 강화돼 contents:write 가 사용자 마찰 추가될 경우. fine-grained PAT 발급 모델로 전환 검토 (사용자 입장 마찰 증가는 트레이드오프)

## 관련

- **회고**: `docs/retrospective/v1.1.x.md` 5절 (v2.0 정체성 — 옵션 3 SaaS-lite 채택), 8절 (v2.0 호흡 분량 추정 8~10)
- **ADR**: ADR 002 (config-driven approach) — editor 가 schema 단일 진입점 의존, ADR 005 (multi-theme runtime strategy) — preview 가 같은 테마 토큰 시스템 재사용, ADR 007/008/009 — 도메인 적정 트레이드오프 패턴 선례
- **신규 진입점** (Phase 2~): `app/edit/` · `lib/editor/` · `app/api/github/` (Phase 3) · `app/api/vercel/` (Phase 4)
- **새 의존성**: `zustand` (MIT, ~1KB) — Phase 2 첫 호흡에 `npm install`. Octokit (`@octokit/rest`) 는 Phase 3 진입 시 별도 검토
- **`.claude/rules/` 신규**: editor 의존성·OAuth 흐름이 누적되면 `editor.md` (또는 `github-oauth.md`) 분리 후보 — Phase 3 진입 시 결정
