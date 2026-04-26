/**
 * invitation.config.types.ts
 *
 * `invitation.config.ts` 의 데이터 객체와 분리된 type 정의 파일.
 * 분리 이유 — ADR 011 결정 4: v2.0 editor 가 `invitation.config.ts` 를
 * deterministic 전체 재생성할 때 type 정의까지 매번 재생성하지 않도록.
 * editor 가 다루는 것은 데이터 파일 1 개 (`invitation.config.ts`),
 * type 정의는 이 파일에서 안정적으로 유지된다.
 */

/**
 * 현재 구현된 테마 목록. 추가 테마는 v1.1+ 후보 (minimal · vintage).
 * 설계 근거는 docs/adr/005-multi-theme-runtime-strategy.md.
 */
export type ThemeName = "classic" | "modern" | "floral";

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
  /**
   * 공유 카드 내 버튼. 카카오 feed 템플릿은 최대 2개까지 렌더.
   * URL 은 사용자가 직접 쓰지 않고 구현이 자동 유도한다 — 자세한 근거는 `docs/adr/004-share-buttons-schema.md`.
   * 미설정 시 `site` 만 활성 (카드 전체가 `meta.siteUrl` 로 이동하는 효과).
   */
  buttons?: {
    /** 청첩장 보기 — URL 은 `meta.siteUrl` 에서 자동 유도. `enabled` 미설정 시 `true`. */
    site?: { enabled?: boolean; label?: string };
    /** 지도 보기 — URL 은 `venue.coords` + `venue.name` 으로 카카오맵 딥링크 자동 조립. `enabled` 미설정 시 `false`. */
    map?: { enabled?: boolean; label?: string };
  };
}

export interface GuestbookConfig {
  enabled: boolean;
  /** 삭제 시 필요한 비밀번호 최소 길이 */
  minPasswordLength?: number;
  /** 욕설 필터 사용 여부 */
  profanityFilter?: boolean;
}

export interface RSVPConfig {
  enabled: boolean;
  /**
   * RSVP 마감 시각 (ISO 8601, 타임존 포함 권장).
   * 미설정 시 항상 활성. 마감 후 form 은 disable + 안내 문구 노출.
   */
  deadline?: string;
  /** 폼 상단 안내 문구. 미설정 시 기본값 사용 */
  message?: string;
  /**
   * 선택 입력 필드 표시 토글. 미설정 시 모두 표시.
   * 필수 필드 (이름·참석여부·신랑·신부측) 는 항상 노출.
   */
  fields?: {
    /** 동반 인원 (본인 제외, 0~5) */
    companions?: boolean;
    /** 메시지 (0~200자, 빈 문자열 허용) */
    message?: boolean;
  };
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

  /**
   * Hero (메인 화면) 배경 사진. 미설정 시 cream 단색 배경 + 진한 텍스트.
   * 설정 시 풀스크린 사진 + gradient overlay + 흰 텍스트.
   */
  hero?: {
    /** `public/images/` 기준 상대 경로 또는 절대 URL */
    backgroundImage: string;
    /** 접근성 alt — 미설정 시 "결혼식 메인 사진" */
    alt?: string;
  };

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

  /** RSVP — 참석 여부 응답 (Firebase 연결 시 활성화) */
  rsvp: RSVPConfig;

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
