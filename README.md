<div align="center">

# 💌 invitation-kit

**한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿**

설정 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조

[데모 보기](#) · [5분 시작하기](#-5분-시작하기) · [문서](./docs) · [기능](#-주요-기능)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new)

[English](./README.en.md) · **한국어**

</div>

---

## ✨ 왜 invitation-kit인가요?

- 🎯 **Config 한 파일만 수정** — `invitation.config.ts` 하나만 건드리면 전체 청첩장이 바뀌어요
- 🇰🇷 **한국 결혼식에 진심** — 카카오톡 공유하기, 네이버/카카오 지도, 한국 계좌 복사 기본 탑재
- 🎨 **다중 테마** — 모던, 클래식, 플로럴, 미니멀, 빈티지 중 선택
- 💰 **완전 무료 · 영구 유지** — Vercel + Firebase 무료 티어로 월 ₩0 운영
- 🚫 **광고/워터마크 없음** — 내 청첩장은 내 것
- 📱 **완전 반응형** — 모바일 Safari/Chrome 완벽 지원

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
  groom: { name: "김철수", father: "김아버지", mother: "박어머니" },
  bride: { name: "이영희", father: "이아버지", mother: "최어머니" },
  date: "2026-05-17T12:00:00+09:00",
  venue: {
    name: "예식홀 2층 그랜드볼룸",
    address: "서울시 강남구 ...",
    coords: { lat: 37.5, lng: 127.0 },
  },
  theme: "modern", // 'modern' | 'classic' | 'floral' | 'minimal' | 'vintage'
  // ... 자세한 내용은 아래 '설정 가이드' 참고
};
```

### 3. 사진 추가

`public/images/gallery/` 폴더에 사진을 넣으세요. 파일명은 자동 인식돼요.

### 4. 배포

GitHub에 푸시하고 [Vercel](https://vercel.com/new)에서 저장소를 Import만 하면 끝.

🎉 **축하합니다! 본인만의 청첩장 URL이 생겼어요.**

---

## 📦 주요 기능

### 기본 (v0.1.0)

- 📸 사진 갤러리 (lightbox 확대 뷰)
- 📍 오시는 길 (네이버/카카오/구글 지도 버튼)
- 💰 계좌번호 원클릭 복사
- 💬 카카오톡 공유하기 + URL 복사

### v1.0.0

- ✍️ 방명록 (Firebase Firestore)
- ⏰ D-day 카운트다운
- 📅 구글 캘린더 일정 추가
- 🎨 테마 3종 이상

### 로드맵 (v1.1+)

- RSVP 참석 여부 응답
- 배경 음악 (무음 모드 존중)
- 웹 기반 config 편집기 UI
- 이미지 자동 최적화 CLI

---

## 📖 설정 가이드

자세한 설정 옵션은 [설정 가이드](./docs/config-guide.md)를 참고하세요.

### 필수 환경변수

`.env.local` 파일을 만들어 다음 키를 입력하세요:

```env
NEXT_PUBLIC_KAKAO_APP_KEY=카카오_JavaScript_키
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=네이버_지도_클라이언트_ID
NEXT_PUBLIC_SITE_URL=https://본인사이트.vercel.app

# 방명록 사용 시에만 필요
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

각 키를 받는 방법은 [API 키 발급 가이드](./docs/api-keys.md)에 단계별로 정리돼 있어요.

---

## 🗂 프로젝트 구조

```
invitation-kit/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 메인 청첩장 페이지
│   └── layout.tsx           # 메타 태그, OG 이미지
├── components/
│   ├── sections/            # Main, Gallery, Venue, Guestbook 등
│   ├── theme/               # 테마별 스타일
│   └── shared/              # 공통 UI
├── lib/
│   ├── kakao.ts             # 카카오 SDK 헬퍼
│   ├── firebase.ts          # Firestore 연결
│   └── clipboard.ts         # 계좌 복사
├── public/
│   └── images/gallery/      # 여기에 사진 넣기
├── invitation.config.ts     # ✨ 여기만 수정하면 됨
└── README.md
```

---

## 🤝 기여하기

이슈, PR, 새로운 테마 제안 모두 환영해요!

- 버그 신고: [Issues](../../issues)
- 기능 제안: [Discussions](../../discussions)
- 새로운 테마 추가: [테마 제작 가이드](./docs/theme-guide.md)

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

---

## 📄 라이선스

MIT © 2026 — 자유롭게 Fork해서 본인 또는 친구의 결혼식에 사용하세요 💍

---

## 🙏 영감을 받은 프로젝트들

- [wzulfikar/nextjs-wedding-invite](https://github.com/wzulfikar/nextjs-wedding-invite)
- [immutable.wedding](https://immutable.wedding)
- 그 외 수많은 개발자분들의 청첩장 개발기 포스트

한국 결혼식 문화에 맞춘 오픈소스가 있으면 좋겠다는 마음에서 시작된 프로젝트입니다.
