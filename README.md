<div align="center">

# 💌 invitation-kit

**한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿**

설정 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조

[데모](#-데모) · [5분 시작하기](#-5분-시작하기) · [가이드](#-가이드) · [기능](#-주요-기능)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

[English](./README.en.md) · **한국어**

</div>

---

## ✨ 왜 invitation-kit인가요?

- 🎯 **Config 한 파일만 수정** — `invitation.config.ts` 하나만 건드리면 전체 청첩장이 바뀌어요
- 🇰🇷 **한국 결혼식에 진심** — 카카오톡 공유 카드, 카카오맵·네이버 지도 딥링크, 양가 부모 표기, 계좌번호 복사 (한국식 축의금 문화), 방명록 모두 기본 탑재
- 🎨 **다중 테마 (Classic · Modern · Floral)** — `theme` config 한 값만 바꾸면 팔레트·폰트·radius 전환. 새 테마 추가는 4 곳 수정으로 끝
- 💰 **완전 무료 · 영구 유지** — Vercel Hobby 티어 + Firebase Spark 무료 티어로 월 ₩0 운영
- 🚫 **광고/워터마크 없음** — 내 청첩장은 내 것
- 📱 **모바일 Safari 1순위 검증** — iOS 26 에서 발견한 회귀들을 규칙으로 문서화 (`CLAUDE.md` 의 "애니메이션 사용 규칙" 섹션)

---

## 🎬 데모

[**라이브 데모 — invitation-kit.vercel.app**](https://invitation-kit.vercel.app) — 가상 커플 `김철수 ♥ 이영희` 의 청첩장. 갤러리·방명록·카카오 공유·구글 캘린더 모두 정상 동작.

### 데스크톱

<img src="./public/images/screenshots/desktop-home.jpg" alt="데스크톱 홈 풀페이지 — 메인 hero 부터 닫는 인사까지" width="800" />

### 모바일

|                                                         메인                                                          |                                                  갤러리 라이트박스                                                  |                                                        Venue (지도·캘린더)                                                        |                                                  방명록                                                  |
| :-------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------: |
| <img src="./public/images/screenshots/mobile-home.jpg" alt="모바일 메인 — 신랑·신부 이름 + D-day 배지" width="200" /> | <img src="./public/images/screenshots/mobile-gallery-lightbox.jpg" alt="갤러리 라이트박스 열린 상태" width="200" /> | <img src="./public/images/screenshots/mobile-venue.jpg" alt="Venue 섹션 — 카카오맵·네이버 지도·구글 캘린더 3 버튼" width="200" /> | <img src="./public/images/screenshots/mobile-guestbook.jpg" alt="방명록 — 작성 폼 + 댓글" width="200" /> |

### 다중 테마

`theme: "classic" | "modern" | "floral"` 한 값으로 전환 — 컴포넌트 코드 수정 0 건 ([테마 가이드](./docs/theme-guide.md)):

<img src="./public/images/screenshots/theme-comparison.png" alt="Classic · Modern · Floral 테마 비교 — 같은 청첩장, 3 가지 분위기" width="900" />

---

## 🚀 5분 시작하기

### 1. Fork & Clone

이 저장소 오른쪽 위 **Fork** 버튼을 누르세요. 그다음:

```bash
git clone https://github.com/본인계정/invitation-kit.git
cd invitation-kit
npm install
```

### 2. 설정 파일 수정

`invitation.config.ts` 파일 한 개만 열어서 본인 정보로 수정하세요.

```ts
export const config: InvitationConfig = {
  meta: {
    title: "신랑 ♥ 신부의 결혼식에 초대합니다",
    description: "2026년 5월 17일, 저희 두 사람의 시작을 함께해 주세요.",
    siteUrl: "https://your-project.vercel.app", // 배포 후 본인 도메인으로 교체
  },
  theme: "classic", // "classic" | "modern" | "floral"
  groom: { name: "신랑", order: "장남", father: "아버지", mother: "어머니" },
  bride: { name: "신부", order: "장녀", father: "아버지", mother: "어머니" },
  date: "2026-05-17T12:00:00+09:00",
  venue: {
    name: "예식홀 이름",
    address: "서울시 ...",
    coords: { lat: 37.5, lng: 127.0 },
  },
  // ... 자세한 필드 설명은 docs/config-guide.md 참고
};
```

> 모든 필드 설명·운영 시점 변형 패턴 (좌표 얻는 법, 부모 한 분만 표기, iOS 자동재생 차단 등) 은 [Config 가이드](./docs/config-guide.md).

### 3. Vercel 배포

GitHub 에 푸시한 레포를 https://vercel.com/new 에서 import → `Deploy`. 1~2분 후 `your-project.vercel.app` 발급.

발급된 도메인을 `invitation.config.ts` 의 `meta.siteUrl` · `share.thumbnailUrl` 에 입력 후 다시 푸시. 이 값이 카카오 공유 카드의 링크 대상이 됩니다.

### 4. (카카오톡 공유 사용 시) 카카오 Developers 콘솔

카카오톡 공유를 안 쓰면 스킵 — 공유 버튼은 URL 복사 폴백으로 자연 동작.

https://developers.kakao.com/console/app 에서 앱 생성 후 **두 필드 모두** 에 본인 Vercel 도메인 등록:

- `[앱] > 플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인` — `Kakao.init()` 허용
- `[앱] > 제품 링크 관리 > 웹 도메인` — 공유 카드의 `link.webUrl` 호스트 검증

공유 카드 안에 "지도 보기" 버튼도 쓰려면 **웹 도메인 쪽에 `https://map.kakao.com` 도 추가**. 미등록 시 버튼이 청첩장 홈으로 strip 됩니다.

`[앱 키]` 페이지의 **JavaScript 키** 를 Vercel → Project Settings → Environment Variables 에 `NEXT_PUBLIC_KAKAO_APP_KEY` 로 등록 (Production · Preview · Development 3 개 체크) 후 Deployments 탭에서 **Redeploy**. `NEXT_PUBLIC_*` 변수는 빌드 시점에 인라인되므로 재배포 필수.

> ⚠️ **카카오톡 공유 end-to-end 검증은 프로덕션 도메인 + 실기기 카카오톡 환경에서만 가능합니다.** localhost·LAN IP·Vercel 프리뷰에서는 카카오 정책상 카드 링크의 host 가 콘솔 default 로 강제 치환됩니다. 단계·정책 배경 풀버전은 [API 키 발급 가이드](./docs/api-keys.md) · [`.claude/rules/kakao-sdk.md`](./.claude/rules/kakao-sdk.md).

### 5. (방명록 사용 시) Firebase 설정

방명록을 안 쓰면 `invitation.config.ts` 의 `guestbook.enabled = false` 로 두고 스킵.

[Firebase Console](https://console.firebase.google.com) 에서 프로젝트 생성 시 **핵심 4 가지**:

- **Standard edition** (Enterprise 금지 — 비용 + 기능 분리)
- 위치 **`asia-northeast3` (서울)** — 한 번 선택하면 영구 변경 불가
- **프로덕션 모드로 시작** (테스트 모드 금지 — 30일 후 만료 + 그 전엔 누구나 쓰기)
- 웹 앱 등록 시 **"이 앱에 Firebase Hosting 도 설정하기" 체크 해제** (Vercel 사용 — Hosting 충돌 회피)

`firebaseConfig` 6 필드를 받아 Vercel Environment Variables 에 6 키 (`NEXT_PUBLIC_FIREBASE_*`) 모두 등록 (Production · Preview 체크) → Deployments 에서 **Redeploy** → Firestore Console 의 "규칙" 탭에 본 레포의 [`firestore.rules`](./firestore.rules) 본문 붙여넣기.

> ⚠️ **`.env.local` 만 채우고 Vercel 등록을 빠뜨리면 dev 만 동작 / prod 작성 실패** — `NEXT_PUBLIC_*` 변수는 빌드 시점 인라인이라 Vercel 빌드에 등록돼 있지 않으면 `auth/invalid-api-key` 류 에러로 SDK 가 죽습니다. 단계별 화면 + 흔한 실수 5건은 [API 키 발급 가이드](./docs/api-keys.md).

🎉 **축하합니다! 본인만의 청첩장 URL이 생겼어요.**

---

## 📦 주요 기능

### 현재 출시 (v0.2.0)

- 🏷 **메인 히어로** — 신랑·신부 이름 + 결혼식 날짜 + 자동 계산 D-day 배지
- ✉️ **인사말 (Greeting)** — config 의 문단 배열을 CSS 페이드인으로 표시
- 📸 **사진 갤러리 + 라이트박스** — CSS columns 기반 masonry + 좌우 버튼 · ArrowLeft/Right · 터치 스와이프 (100px threshold) · 백드롭 탭 · Escape · wrap-around 순환. `next/image` 최적화
- 📍 **오시는 길 (Venue)** — 주소 + 카카오맵·네이버 지도 딥링크 + **구글 캘린더 일정 추가** 버튼 + 교통편 (지하철·버스·자가용·주차)
- 💰 **계좌번호 복사 (Accounts)** — 신랑/신부 세그먼트 토글 + 아코디언 + 하이픈 제거 복사 (일부 은행 앱 파싱 대응) + 카카오페이·토스 딥링크 (config 에 있을 때만 조건부)
- ✍️ **방명록 (Guestbook)** — Firebase Firestore + bcryptjs 비밀번호 해싱 (salt 10) + 욕설 필터 (badwords-ko 574 + 자체 자음 변형 10). 4상태 (loading/ready/error/empty) + optimistic prepend. 메시지 삭제는 운영자가 Firebase Console 에서 수동 (MVP `allow delete: if false`)
- 💬 **카카오톡 공유 (Share)** — Kakao SDK v2.8.1 `Kakao.Share.sendDefault` feed 템플릿. SDK 미초기화·인앱 웹뷰·데스크톱 등 실패 상황엔 URL 복사 폴백 자동
- 🚨 **인앱 웹뷰 안내 배너** — 카카오톡·Instagram·Facebook·네이버·Line 웹뷰 감지 시 "외부 브라우저로 열어주세요" 배너. `sessionStorage` dismiss
- 🎨 **다중 테마 (Classic · Modern · Floral)** — `:root[data-theme]` + Tailwind v4 `@theme` CSS 변수 override. 컴포넌트 수정 0 건으로 테마 전환
- 🌐 **OG 메타 태그** — 카카오톡·iMessage·Twitter 미리보기 썸네일 (800×400 `public/images/og.png`)

### v1.0.0 목표 (10주차)

- Lighthouse 90+ · 모바일 Safari·Android Chrome·인앱 웹뷰 4 환경 기기 매트릭스
- 데모 사이트 (가상 커플) + README 데모 링크 + 스크린샷·GIF
- `v1.0.0` 태그 + GitHub Release

### v1.1+ 로드맵

- RSVP 참석 여부 응답
- 방명록 본인 삭제 (Cloud Function 프록시)
- 다국어 UI (i18n)
- 배경 음악 (무음 모드 존중)
- Apple Calendar 일정 추가
- 웹 기반 config 편집기 UI
- App Check (방명록 스팸 방지)
- 이미지 자동 최적화 CLI

> 자세한 변경 이력은 [CHANGELOG.md](./CHANGELOG.md) 참조.

---

## 📖 환경변수

`.env.example` 을 복사해 `.env.local` 로 만든 뒤 채우세요. **방명록 안 쓰면 Firebase 6 키는 모두 비워둬도 됨** — 카카오 공유만 쓸 거면 1 키 (`NEXT_PUBLIC_KAKAO_APP_KEY`) 만으로 충분.

```env
# 카카오톡 공유 기능 사용 시. 빈 값이면 공유 버튼이 "URL 복사" 폴백으로 자연 동작.
NEXT_PUBLIC_KAKAO_APP_KEY=

# 방명록 사용 시 (Firebase Firestore). 6 키 모두 빈 값이면 방명록 SDK init 실패 — guestbook.enabled = false 로 끄세요.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> ⚠️ **로컬 `.env.local` + Vercel Environment Variables 양쪽 모두 등록 + Production·Preview 체크 + 재배포 가 한 묶음.** Vercel 등록 누락이 가장 흔한 실수 1번 (dev 만 동작 / prod 실패). 단계별 풀 가이드는 [API 키 발급 가이드](./docs/api-keys.md).

---

## 📚 가이드

비개발자도 따라올 수 있도록 사용자 시점으로 작성된 가이드 3 종.

- **[API 키 발급 가이드](./docs/api-keys.md)** — 카카오 + Firebase 키 발급 단계, 카카오 도메인 2 필드 등록, Firebase Console 핵심 4 가지, Vercel Environment Variables + 재배포, 흔한 실수 5 건
- **[Config 가이드](./docs/config-guide.md)** — `invitation.config.ts` 의 11 top-level 키 전수 + 좌표 얻는 법·부모 한 분만 표기·양가 빈 배열·iOS 자동재생 차단·CLS 방지·`share.buttons` 활성 조합표 같은 운영 시점 변형 패턴
- **[테마 가이드](./docs/theme-guide.md)** — 9 변수 토큰 카탈로그, 4 번째 테마 (`vintage` 가상 시나리오) 추가 5 단계, Modern worked example (디자인 의도 + 변경 토큰 7 개 + 실제 코드), Floral 짧은 노트, 디자인 결정 가이드 + Gotcha 5 건

---

## 🗂 프로젝트 구조

```
invitation-kit/
├── app/                       # Next.js 16 App Router
│   ├── page.tsx              # 메인 청첩장 (섹션들을 합치는 레일, guestbook 조건부 마운트)
│   ├── layout.tsx            # 메타 태그, 폰트 4종, <html data-theme={config.theme}>
│   ├── globals.css           # Tailwind v4 @theme 토큰 + Modern·Floral override
│   └── fonts/                # Pretendard Variable (self-host)
├── components/
│   ├── sections/             # Main · Greeting · Gallery · Venue · Accounts · Guestbook · Share
│   │   └── guestbook/        # GuestbookForm · GuestbookList (orchestrator 분할)
│   ├── DDayBadge.tsx         # D-day 배지 (Client)
│   └── InAppBrowserNotice.tsx # 인앱 웹뷰 배너 (Client)
├── lib/
│   ├── firebase.ts           # Firestore db 싱글톤 (HMR 가드)
│   ├── kakao.ts              # Kakao Share SDK wrapper
│   ├── map.ts                # 카카오맵 · 네이버 지도 딥링크
│   ├── calendar.ts           # 구글 캘린더 URL pure function
│   ├── clipboard.ts          # 클립보드 복사
│   ├── hash.ts               # bcryptjs 비밀번호 해싱
│   ├── profanity.ts          # 욕설 필터 (badwords-ko + 자음 변형)
│   ├── userAgent.ts          # 인앱 웹뷰 감지
│   ├── date.ts               # D-day 계산
│   └── hooks.ts              # useIsClient (useSyncExternalStore)
├── public/images/            # og.png + gallery/sample-01~09.jpg
├── invitation.config.ts       # ✨ 여기만 수정하면 됨
├── .env.example              # 카카오 1 키 + Firebase 6 키 샘플
├── firestore.rules           # 방명록 보안 규칙
├── firebase.json             # Firestore Emulator 설정
├── .claude/rules/            # 영역별 작업 규칙 (kakao-sdk.md · firebase.md)
└── docs/
    ├── api-keys.md           # API 키 발급 가이드
    ├── config-guide.md       # Config 가이드
    ├── theme-guide.md        # 테마 가이드
    ├── adr/                  # 설계 결정 기록 (현재 6 건)
    └── retrospective/        # 주차별 회고
```

---

## 🤝 기여하기

이슈, PR, 새 테마 제안 모두 환영합니다. 자세한 흐름·환영 범위·환영 안 하는 영역·표준 quality gate 시퀀스는 [`CONTRIBUTING.md`](./CONTRIBUTING.md).

- 버그 신고: [Issues](../../issues)
- 기능 제안 · 토론: [Discussions](../../discussions)
- 새 테마 PR: [테마 가이드](./docs/theme-guide.md) 의 5 단계 흐름 그대로
- PR 보낼 때는 [PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md) 의 체크리스트 (모바일 Safari 검증·개인정보 확인) 를 참고해주세요.

---

## 📄 라이선스

MIT © 2026 — 자유롭게 Fork해서 본인 또는 친구의 결혼식에 사용하세요 💍

---

## 🙏 영감을 받은 프로젝트들

- [wzulfikar/nextjs-wedding-invite](https://github.com/wzulfikar/nextjs-wedding-invite)
- [immutable.wedding](https://immutable.wedding)
- 그 외 수많은 개발자분들의 청첩장 개발기 포스트

한국 결혼식 문화에 맞춘 오픈소스가 있으면 좋겠다는 마음에서 시작된 프로젝트입니다.
