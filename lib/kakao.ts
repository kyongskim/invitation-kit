/**
 * Kakao JavaScript SDK 통합 (`Kakao.Share.sendDefault` wrapper).
 *
 * SDK 자체는 `components/sections/Share.tsx` 의 next/script 가 CDN 에서
 * 로드한다 (lib 단계에서 import 하지 않음 — 카카오 SDK 는 npm 패키지
 * 형태로 배포되지 않음). 이 파일은 window.Kakao 가 존재한다는 전제로
 * 안전 가드와 도메인 wrapper 만 제공.
 *
 * 정책 배경: `.claude/rules/kakao-sdk.md`.
 * - SSR-safe (`typeof window` 가드)
 * - `isInitialized()` 가드 (중복 init 시 SDK 가 throw)
 * - 글로벌 Provider 사용 안 함, 환경변수 부재·도메인 미등록 시 호출부의
 *   try/catch 가 폴백(URL 복사) 으로 자연 처리되도록 throw.
 */

import { kakaoMapDeeplink } from "./map";

interface KakaoShareButton {
  title: string;
  link: { mobileWebUrl: string; webUrl: string };
}

interface KakaoSendDefaultArgs {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    imageWidth?: number;
    imageHeight?: number;
    link: { mobileWebUrl: string; webUrl: string };
  };
  buttons?: KakaoShareButton[];
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share?: {
        sendDefault: (args: KakaoSendDefaultArgs) => void;
      };
    };
  }
}

export function initKakao(): void {
  if (typeof window === "undefined") return;
  if (!window.Kakao) return;
  if (window.Kakao.isInitialized()) return;
  const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  if (!key) return;
  window.Kakao.init(key);
}

export function isKakaoShareReady(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
    window.Kakao &&
    window.Kakao.isInitialized() &&
    window.Kakao.Share?.sendDefault,
  );
}

export interface ShareInput {
  title: string;
  description: string;
  thumbnailUrl: string;
  siteUrl: string;
  buttons?: {
    site?: { enabled?: boolean; label?: string };
    map?: { enabled?: boolean; label?: string };
  };
  venue: { name: string; coords: { lat: number; lng: number } };
}

export function shareInvitation(input: ShareInput): void {
  if (!isKakaoShareReady()) {
    throw new Error("KAKAO_NOT_READY");
  }

  const buttons: KakaoShareButton[] = [];

  const siteEnabled = input.buttons?.site?.enabled ?? true;
  if (siteEnabled) {
    buttons.push({
      title: input.buttons?.site?.label ?? "청첩장 보기",
      link: { mobileWebUrl: input.siteUrl, webUrl: input.siteUrl },
    });
  }

  const mapEnabled = input.buttons?.map?.enabled ?? false;
  if (mapEnabled) {
    const mapUrl = kakaoMapDeeplink({
      name: input.venue.name,
      coords: input.venue.coords,
    });
    buttons.push({
      title: input.buttons?.map?.label ?? "지도 보기",
      link: { mobileWebUrl: mapUrl, webUrl: mapUrl },
    });
  }

  window.Kakao!.Share!.sendDefault({
    objectType: "feed",
    content: {
      title: input.title,
      description: input.description,
      imageUrl: input.thumbnailUrl,
      imageWidth: 800,
      imageHeight: 400,
      link: { mobileWebUrl: input.siteUrl, webUrl: input.siteUrl },
    },
    buttons: buttons.length > 0 ? buttons : undefined,
  });
}
