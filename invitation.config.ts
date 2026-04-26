/**
 * invitation.config.ts
 *
 * 이 파일 하나만 수정하면 전체 청첩장이 바뀝니다.
 * 사용하지 않는 섹션은 `null` 또는 `{ enabled: false }` 로 비활성화할 수 있어요.
 *
 * v2.0 editor (`/edit`) 사용 시 이 파일은 form 입력으로 자동 재생성됩니다.
 * editor 가 다루지 않는 schema 확장이 필요하면 v1.x 직접 편집 모드로.
 *
 * type 정의는 `./invitation.config.types` 에 분리되어 있습니다 (ADR 011 결정 4).
 */

import type { InvitationConfig } from "./invitation.config.types";

export type { InvitationConfig } from "./invitation.config.types";

export const config: InvitationConfig = {
  meta: {
    title: "김철수 ♥ 이영희의 결혼식에 초대합니다",
    description: "2026년 5월 17일, 저희 두 사람의 시작을 함께해 주세요.",
    siteUrl: "https://invitation-kit.vercel.app",
  },

  theme: "classic",

  hero: {
    backgroundImage: "/images/gallery/sample-01.jpg",
    alt: "신랑·신부 웨딩 촬영",
  },

  groom: {
    name: "김철수",
    order: "장남",
    father: "김아버지",
    mother: "박어머니",
  },
  bride: {
    name: "이영희",
    order: "차녀",
    father: "이아버지",
    mother: "최어머니",
  },

  date: "2026-05-17T12:00:00+09:00",

  venue: {
    name: "더채플 광화문",
    hall: "2층 그랜드볼룸",
    address: "서울특별시 종로구 세종대로 175",
    coords: { lat: 37.5725, lng: 126.9769 },
    transportation: {
      subway: "5호선 광화문역 2번 출구 도보 5분",
      bus: "간선 101, 103 광화문 정류장 하차",
      car: '내비게이션에 "더채플 광화문" 검색',
      parking: "건물 지하 주차장 2시간 무료",
    },
  },

  greeting: {
    title: "소중한 분들을 모십니다",
    message:
      "서로의 다름을 존중하고 같음을 기뻐하며\n\n한 길을 걸어가려 합니다.\n\n축복해 주시면 감사하겠습니다.",
  },

  gallery: [
    {
      src: "/images/gallery/sample-01.jpg",
      alt: "웨딩촬영 01",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/gallery/sample-02.jpg",
      alt: "웨딩촬영 02",
      width: 650,
      height: 836,
    },
    {
      src: "/images/gallery/sample-03.jpg",
      alt: "웨딩촬영 03",
      width: 536,
      height: 352,
    },
    {
      src: "/images/gallery/sample-04.jpg",
      alt: "웨딩촬영 04",
      width: 516,
      height: 338,
    },
    {
      src: "/images/gallery/sample-05.jpg",
      alt: "웨딩촬영 05",
      width: 397,
      height: 527,
    },
    {
      src: "/images/gallery/sample-06.jpg",
      alt: "웨딩촬영 06",
      width: 549,
      height: 626,
    },
    {
      src: "/images/gallery/sample-07.jpg",
      alt: "웨딩촬영 07",
      width: 330,
      height: 469,
    },
    {
      src: "/images/gallery/sample-08.jpg",
      alt: "웨딩촬영 08",
      width: 330,
      height: 469,
    },
    {
      src: "/images/gallery/sample-09.jpg",
      alt: "웨딩촬영 09",
      width: 650,
      height: 433,
    },
  ],

  accounts: {
    groomSide: [
      {
        label: "신랑",
        bank: "국민은행",
        number: "123-45-678901",
        holder: "김철수",
      },
      {
        label: "신랑 아버지",
        bank: "신한은행",
        number: "110-123-456789",
        holder: "김아버지",
      },
      {
        label: "신랑 어머니",
        bank: "우리은행",
        number: "1002-345-678901",
        holder: "박어머니",
      },
    ],
    brideSide: [
      {
        label: "신부",
        bank: "카카오뱅크",
        number: "3333-01-1234567",
        holder: "이영희",
      },
      {
        label: "신부 아버지",
        bank: "농협은행",
        number: "312-1234-5678-91",
        holder: "이아버지",
      },
      {
        label: "신부 어머니",
        bank: "하나은행",
        number: "123-456789-01234",
        holder: "최어머니",
      },
    ],
  },

  share: {
    title: "김철수 ♥ 이영희 결혼합니다",
    description: "2026년 5월 17일 토요일 낮 12시 · 더채플 광화문",
    thumbnailUrl: "https://invitation-kit.vercel.app/images/og.jpg?v=2",
    buttons: {
      site: { enabled: true },
      map: { enabled: true },
    },
  },

  guestbook: {
    enabled: true,
    minPasswordLength: 4,
    profanityFilter: true,
  },

  rsvp: {
    enabled: true,
    deadline: "2026-05-14T23:59:59+09:00",
    message: "참석 여부를 알려주시면\n결혼식 준비에 큰 도움이 됩니다.",
    fields: {
      companions: true,
      message: true,
    },
  },

  // 배경 음악. 음원 파일은 OSS 라이선스 제약으로 ship 하지 않습니다 —
  // 본인 음원 (CC0 / Public Domain / 직접 라이선스 보유) 을
  // public/audio/ 에 두고 enabled: true + src 경로 갱신.
  // iOS 무음 모드 (ringer 스위치 OFF) 에선 들리지 않습니다.
  music: {
    enabled: false,
    src: "/audio/wedding.mp3",
  },

  closing: {
    message: "귀한 걸음으로 축복해 주시면 감사하겠습니다.",
    signature: "김철수 · 이영희 드림",
  },
};
