/**
 * invitation.config.ts
 *
 * 이 파일 하나만 수정하면 전체 청첩장이 바뀝니다.
 * 사용하지 않는 섹션은 `null` 또는 `{ enabled: false }` 로 비활성화할 수 있어요.
 */

export type ThemeName = "modern" | "classic" | "floral" | "minimal" | "vintage";

export interface Person {
  /** 이름 (예: '김철수') */
  name: string;
  /** 신랑/신부 기준 '장남' '차녀' 등 */
  order?: string;
  /** 부 이름 */
  father?: string;
  /** 모 이름 */
  mother?: string;
}

export interface Venue {
  /** 예식장 이름 (예: '더채플 광화문') */
  name: string;
  /** 홀 이름 (예: '2층 그랜드볼룸') */
  hall?: string;
  /** 전체 주소 (도로명 주소 권장) */
  address: string;
  /** 위도/경도 — 지도 버튼 링크 생성에 사용 */
  coords: { lat: number; lng: number };
  /** 교통편 안내 (지하철, 버스, 주차 등) */
  transportation?: {
    subway?: string;
    bus?: string;
    car?: string;
    parking?: string;
  };
}

export interface Account {
  /** 표시 레이블 (예: '신랑', '신랑 아버지') */
  label: string;
  /** 은행 이름 */
  bank: string;
  /** 계좌번호 */
  number: string;
  /** 예금주 */
  holder: string;
  /** 카카오페이 송금 딥링크 (선택) */
  kakaoPayUrl?: string;
  /** 토스 송금 딥링크 (선택) */
  tossUrl?: string;
}

export interface GalleryImage {
  /** public/images/gallery/ 기준 상대 경로 */
  src: string;
  /** 대체 텍스트 (접근성) */
  alt: string;
  /** 원본 가로/세로 (레이아웃 안정화) */
  width?: number;
  height?: number;
}

export interface ShareConfig {
  /** 카카오톡 공유 시 보여질 타이틀 */
  title: string;
  /** 카카오톡 공유 시 보여질 설명 */
  description: string;
  /** 카카오톡 공유 썸네일 이미지 URL (절대 URL) */
  thumbnailUrl: string;
}

export interface GuestbookConfig {
  enabled: boolean;
  /** 삭제 시 필요한 비밀번호 최소 길이 */
  minPasswordLength?: number;
  /** 욕설 필터 사용 여부 */
  profanityFilter?: boolean;
}

export interface InvitationConfig {
  /** 사이트 메타 — <title>과 OG 태그에 사용 */
  meta: {
    title: string;
    description: string;
    siteUrl: string;
  };

  /** 테마 선택 */
  theme: ThemeName;

  /** 신랑 */
  groom: Person;
  /** 신부 */
  bride: Person;

  /** 예식 일시 (ISO 8601, 타임존 포함 권장) */
  date: string;

  /** 예식장 정보 */
  venue: Venue;

  /** 인사말 (줄바꿈은 \n 또는 JSX의 <br />) */
  greeting: {
    title?: string;
    message: string;
  };

  /** 사진 갤러리 */
  gallery: GalleryImage[];

  /** 축의금 계좌 목록 */
  accounts: {
    groomSide: Account[];
    brideSide: Account[];
  };

  /** 공유 설정 */
  share: ShareConfig;

  /** 방명록 (Firebase 연결 시 활성화) */
  guestbook: GuestbookConfig;

  /** 배경 음악 (선택, 기본 꺼짐) */
  music?: {
    enabled: boolean;
    src: string;
    /** 자동 재생하지 않음. 사용자가 버튼을 눌러야만 재생 */
  };

  /** 끝인사 (선택) */
  closing?: {
    message?: string;
    signature?: string;
  };
}

// ============================================================
// 예시 설정 — 본인 정보로 수정하세요
// ============================================================

export const config: InvitationConfig = {
  meta: {
    title: "김철수 ♥ 이영희의 결혼식에 초대합니다",
    description: "2026년 5월 17일, 저희 두 사람의 시작을 함께해 주세요.",
    siteUrl: "https://example.vercel.app",
  },

  theme: "modern",

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
      src: "/images/gallery/01.jpg",
      alt: "웨딩촬영 01",
      width: 1200,
      height: 1800,
    },
    {
      src: "/images/gallery/02.jpg",
      alt: "웨딩촬영 02",
      width: 1800,
      height: 1200,
    },
    // ...
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
    ],
    brideSide: [
      {
        label: "신부",
        bank: "카카오뱅크",
        number: "3333-01-1234567",
        holder: "이영희",
      },
    ],
  },

  share: {
    title: "김철수 ♥ 이영희 결혼합니다",
    description: "2026년 5월 17일 토요일 낮 12시 · 더채플 광화문",
    thumbnailUrl: "https://example.vercel.app/images/og.jpg",
  },

  guestbook: {
    enabled: true,
    minPasswordLength: 4,
    profanityFilter: true,
  },

  closing: {
    message: "귀한 걸음으로 축복해 주시면 감사하겠습니다.",
    signature: "김철수 · 이영희 드림",
  },
};
