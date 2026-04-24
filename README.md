<div align="center">

# 💌 invitation-kit

**한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿**

설정 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조

[데모 보기](https://invitation-kit.vercel.app) · [5분 시작하기](#-5분-시작하기) · [문서](./docs) · [기능](#-주요-기능)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

[English](./README.en.md) · **한국어**

</div>

---

## ✨ 왜 invitation-kit인가요?

- 🎯 **Config 한 파일만 수정** — `invitation.config.ts` 하나만 건드리면 전체 청첩장이 바뀌어요
- 🇰🇷 **한국 결혼식에 진심** — 카카오톡 공유 카드, 카카오맵·네이버 지도 딥링크 기본 탑재 (방명록·계좌 복사·다중 테마는 v1.0 로드맵)
- 💰 **완전 무료 · 영구 유지** — Vercel Hobby 티어로 월 ₩0 운영
- 🚫 **광고/워터마크 없음** — 내 청첩장은 내 것
- 📱 **모바일 Safari 1순위 검증** — iOS 26 에서 발견한 회귀들을 규칙으로 문서화 (`CLAUDE.md` 의 "애니메이션 사용 규칙" 섹션)

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
  groom: {
    name: "신랑",
    order: "장남",
    father: "아버지",
    mother: "어머니",
  },
  bride: { name: "신부", order: "장녀", father: "아버지", mother: "어머니" },
  date: "2026-05-17T12:00:00+09:00",
  venue: {
    name: "예식홀 이름",
    address: "서울시 ...",
    coords: { lat: 37.5, lng: 127.0 },
  },
  // ... 자세한 필드는 invitation.config.ts 파일 상단의 타입 정의 참고
};
```

### 3. 배포 + 카카오 설정

1. **Vercel import**
   GitHub 에 푸시한 레포를 https://vercel.com/new 에서 import → `Deploy`. 1~2분 후 `your-project.vercel.app` 발급.

2. **config 의 URL 교체 후 재푸시**
   `invitation.config.ts` 에서 `meta.siteUrl` 과 `share.thumbnailUrl` 의 호스트를 본인 Vercel 도메인으로 교체. 이 값이 카카오 공유 카드의 링크 대상이 됩니다.

3. **카카오 Developers 콘솔 설정** (카카오톡 공유를 쓸 때만; 안 쓰면 스킵)
   https://developers.kakao.com/console/app 에서 앱 생성 후 **두 필드 모두** 에 본인 Vercel 도메인 등록:
   - `[앱] > 플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인` — `Kakao.init()` 허용
   - `[앱] > 제품 링크 관리 > 웹 도메인` — 공유 카드의 `link.webUrl` 호스트 검증

   공유 카드 안에 "지도 보기" 버튼도 쓰려면 **웹 도메인 쪽에 `https://map.kakao.com` 도 추가**. 미등록 시 버튼이 청첩장 홈으로 strip 됩니다 (정책 배경: [`.claude/rules/kakao-sdk.md`](./.claude/rules/kakao-sdk.md)).

   `[앱 키]` 페이지에서 **JavaScript 키** 복사.

4. **Vercel 환경변수 추가 + 재배포**
   Vercel → Project Settings → Environment Variables 에 `NEXT_PUBLIC_KAKAO_APP_KEY` = (복사한 JS 키) 등록 (Production/Preview/Development 3개 체크). 저장 후 **Deployments 에서 최신 배포를 Redeploy** — `NEXT_PUBLIC_*` 변수는 빌드 타임에 번들되므로 재배포 필수.

> ⚠️ **카카오톡 공유 end-to-end 검증은 프로덕션 도메인 + 실기기 카카오톡 환경에서만 가능합니다.** localhost·LAN IP·Vercel 프리뷰에서는 카카오 정책상 카드 링크의 host 가 콘솔 default 로 강제 치환됩니다. 진짜 동작 확인은 Vercel 배포 후 실기기로.

🎉 **축하합니다! 본인만의 청첩장 URL이 생겼어요.**

---

## 📦 주요 기능

### 현재 구현 (v0.1.0 진행 중)

- 🏷 메인 화면 — 신랑·신부 이름 히어로
- ✉️ 인사말 (Greeting)
- 📍 오시는 길 — 주소 + 카카오맵/네이버 지도 딥링크 + 교통편 (지하철·버스·자가용·주차)
- 💬 카카오톡 공유 카드 — Kakao SDK v2.8.1. 실패 시 URL 복사 폴백

### v1.0.0 목표

- 📸 사진 갤러리 (lightbox)
- 💰 계좌번호 원클릭 복사
- ✍️ 방명록 (Firebase Firestore)
- ⏰ D-day 카운트다운
- 📅 구글 캘린더 일정 추가
- 🎨 다중 테마 (Classic 외 2종 이상)

### v1.1+ 로드맵

- RSVP 참석 여부 응답
- 배경 음악 (무음 모드 존중)
- 웹 기반 config 편집기 UI
- 이미지 자동 최적화 CLI

---

## 📖 환경변수

실제 쓰이는 키는 현재 **1개** 입니다. `.env.example` 을 복사해 `.env.local` 로 만든 뒤 채우세요:

```env
# 카카오톡 공유 기능 사용 시 필수. 콘솔에서 JavaScript 키를 발급받아 채웁니다.
# 빈 값이면 공유 버튼이 "링크 복사" 폴백으로 자연 동작합니다.
NEXT_PUBLIC_KAKAO_APP_KEY=
```

v1.0 에서 방명록(Firebase) · RSVP 추가 시 `NEXT_PUBLIC_FIREBASE_*` 키가 늘어날 예정. 키 발급·콘솔 설정 순서는 [5분 시작하기 3번](#3-배포--카카오-설정) 참고.

---

## 🗂 프로젝트 구조

```
invitation-kit/
├── app/                       # Next.js App Router
│   ├── page.tsx              # 메인 청첩장 (섹션들을 합치는 레일)
│   ├── layout.tsx            # 메타 태그, 폰트, scrollRestoration
│   ├── globals.css           # Tailwind v4 @theme 토큰 (Classic 팔레트)
│   └── fonts/                # Pretendard · Cormorant Garamond (self-host)
├── components/
│   └── sections/             # Main · Greeting · Venue · Share
├── lib/
│   ├── kakao.ts              # Kakao Share SDK wrapper
│   └── map.ts                # 카카오맵 · 네이버 지도 딥링크
├── public/                    # 정적 자산
├── invitation.config.ts       # ✨ 여기만 수정하면 됨
├── .env.example              # NEXT_PUBLIC_KAKAO_APP_KEY 샘플
├── .claude/rules/            # 영역별 작업 규칙 (kakao-sdk.md 등)
└── docs/
    ├── 01-project-brief.md   # 기획 배경
    ├── adr/                  # 설계 결정 기록
    └── retrospective/        # 주차별 회고
```

`components/theme/`, `components/shared/`, `lib/firebase.ts`, `public/images/gallery/` 등은 v1.0 로드맵 스코프로 추후 도입.

---

## 🤝 기여하기

이슈, PR, 새 테마 제안 모두 환영합니다.

- 버그 신고: [Issues](../../issues)
- 기능 제안 · 토론: [Discussions](../../discussions)
- PR 보낼 때는 [PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md) 의 체크리스트 (모바일 Safari 검증·개인정보 확인) 를 참고해주세요.

자세한 기여 가이드(`CONTRIBUTING.md`) 와 테마 제작 가이드는 v1.0 릴리스 (다중 테마 도입 시점) 에 맞춰 추가할 예정입니다.

---

## 📄 라이선스

MIT © 2026 — 자유롭게 Fork해서 본인 또는 친구의 결혼식에 사용하세요 💍

---

## 🙏 영감을 받은 프로젝트들

- [wzulfikar/nextjs-wedding-invite](https://github.com/wzulfikar/nextjs-wedding-invite)
- [immutable.wedding](https://immutable.wedding)
- 그 외 수많은 개발자분들의 청첩장 개발기 포스트

한국 결혼식 문화에 맞춘 오픈소스가 있으면 좋겠다는 마음에서 시작된 프로젝트입니다.
