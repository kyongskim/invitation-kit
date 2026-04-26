"use client";

import Script from "next/script";
import { useRef, useState } from "react";

/**
 * Kakao Maps SDK 가 로드되면 노출하는 글로벌 namespace.
 * Share SDK 의 `window.Kakao` (대문자) 와 별개 — `window.kakao.maps` 의
 * 소문자 진입점.
 */
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: unknown) => unknown;
        Marker: new (options: { map: unknown; position: unknown }) => unknown;
      };
    };
  }
}

type Props = {
  lat: number;
  lng: number;
  /** 마커 ARIA label · alt 용 */
  title: string;
};

/**
 * Kakao Maps SDK 로 인터랙티브 지도 임베드.
 *
 * 정책:
 * - `NEXT_PUBLIC_KAKAO_APP_KEY` 누락 시 graceful skip (null 반환). 카카오
 *   미설정 사용자도 청첩장 정상 동작
 * - SDK 는 `dapi.kakao.com/v2/maps/sdk.js?appkey=KEY&autoload=false` 에서
 *   load. `autoload=false` + `kakao.maps.load(cb)` 패턴으로 명시 init —
 *   카카오 권장
 * - Share SDK 의 `kakao.min.js` 와 별도 스크립트지만 같은 JavaScript 키
 *   재사용 (.claude/rules/kakao-sdk.md Scope 참조)
 * - next/script 의 `onReady` 는 mount 마다 발화 — 라우트 변경·재mount
 *   에 안전
 */
export function MapEmbed({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

  const initMap = () => {
    if (!ref.current || !window.kakao?.maps) return;
    try {
      window.kakao.maps.load(() => {
        const center = new window.kakao!.maps.LatLng(lat, lng);
        const map = new window.kakao!.maps.Map(ref.current!, {
          center,
          level: 3,
        });
        new window.kakao!.maps.Marker({ map, position: center });
      });
    } catch (err) {
      console.warn("[map] init failed", err);
      setError(true);
    }
  };

  if (!appKey) return null;
  if (error) return null;

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`}
        strategy="afterInteractive"
        onReady={initMap}
      />
      <div
        ref={ref}
        aria-label={`${title} 위치 지도`}
        className="border-accent mt-6 h-64 w-full overflow-hidden rounded-sm border"
      />
    </>
  );
}
