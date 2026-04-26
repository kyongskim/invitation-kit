"use client";

import { useEffect, useRef, useState } from "react";

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

const SDK_SRC = "https://dapi.kakao.com/v2/maps/sdk.js";

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
 * - `NEXT_PUBLIC_KAKAO_APP_KEY` 누락 시 graceful skip (null 반환).
 *   카카오 미설정 사용자도 청첩장 정상 동작
 * - SDK 는 `dapi.kakao.com/v2/maps/sdk.js?appkey=KEY&autoload=false` 에서
 *   load. `autoload=false` + `kakao.maps.load(cb)` 패턴으로 명시 init —
 *   카카오 권장
 * - **next/script 대신 직접 script 태그** — next/script 의 onReady 가
 *   production build 에서 일관되게 fire 안 되는 사례 확인됨. useEffect
 *   안에서 directly DOM 에 script 추가하면 onload 가 안정적
 * - 이미 같은 src 의 script 가 있으면 중복 추가 안 함 (HMR / 재mount 안전)
 */
export function MapEmbed({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

  useEffect(() => {
    if (!appKey || !ref.current) return;

    const initMap = () => {
      if (!ref.current || !window.kakao?.maps?.load) return;
      try {
        window.kakao.maps.load(() => {
          if (!ref.current) return;
          const center = new window.kakao!.maps.LatLng(lat, lng);
          const map = new window.kakao!.maps.Map(ref.current, {
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

    // SDK 이미 로드된 경우 (HMR 후 재mount 등) 즉시 init
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    // 같은 src 의 script 가 이미 DOM 에 있으면 그 load 이벤트만 listen
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SDK_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    // SDK script 처음 로드
    const script = document.createElement("script");
    script.src = `${SDK_SRC}?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => {
      console.warn("[map] SDK script failed to load");
      setError(true);
    };
    document.head.appendChild(script);
  }, [appKey, lat, lng]);

  if (!appKey) return null;
  if (error) return null;

  return (
    <div
      ref={ref}
      aria-label={`${title} 위치 지도`}
      className="border-accent mt-6 h-64 w-full overflow-hidden rounded-sm border"
    />
  );
}
