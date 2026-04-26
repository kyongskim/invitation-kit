"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * SSR 단계에서는 false, 클라이언트 hydration 이후엔 true 를 반환.
 * `window` 접근·타이머·BOM 의존 로직을 첫 페인트 이후로 미루는 데 사용.
 *
 * useEffect 안에서 setState 로 토글하는 패턴 대비 이점:
 * - SSR HTML 과 첫 클라이언트 렌더가 일치 (hydration mismatch 없음)
 * - useEffect 1 회 실행 비용 절약
 * - React 19 의 `react-hooks/set-state-in-effect` 룰과 충돌하지 않음
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

// useSyncExternalStore 의 getSnapshot 은 *stable* 값을 반환해야 한다 —
// 호출마다 `Date.now()` 같은 새 값을 반환하면 React 가 매 렌더에서
// snapshot 변화를 감지해 무한 re-render → bail-out 으로 화면 freeze.
// subscribe 가 캐시값을 갱신하고 listener 알리는 방식으로 stability 보장.
let cachedNow = 0;
const clockListeners = new Set<() => void>();
let clockIntervalId: number | null = null;

const clockSubscribe = (callback: () => void) => {
  if (clockListeners.size === 0 && typeof window !== "undefined") {
    cachedNow = Date.now();
    clockIntervalId = window.setInterval(() => {
      cachedNow = Date.now();
      clockListeners.forEach((listener) => listener());
    }, 1000);
  } else if (typeof window !== "undefined") {
    cachedNow = Date.now();
  }
  clockListeners.add(callback);
  // subscribe 직후 첫 렌더가 lastKnown 으로 정확히 갱신되도록 즉시 알림
  callback();
  return () => {
    clockListeners.delete(callback);
    if (clockListeners.size === 0 && clockIntervalId !== null) {
      window.clearInterval(clockIntervalId);
      clockIntervalId = null;
    }
  };
};

const clockGetSnapshot = () => cachedNow;
const clockGetServerSnapshot = () => 0;

/**
 * 1초 간격으로 갱신되는 현재 timestamp.
 *
 * useSyncExternalStore 패턴 — useEffect + setState 로 setInterval 거는
 * 패턴 대비 React 19 `react-hooks/set-state-in-effect` 룰 안전 + SSR
 * 결정성 (서버는 항상 0 반환, 클라이언트 hydration 후에만 실 시각 노출).
 *
 * 함정: getSnapshot 이 매번 `Date.now()` 반환하면 React 가 무한 re-render
 * 으로 freeze. 모듈 단위 cache + subscribe 시점 갱신으로 stability 보장.
 * 0 반환 시 hydration 직후 아직 subscribe 완료 전인 의미 — DDayBadge 가
 * 이를 sentinel 로 활용해 0 일 때 null 반환으로 잘못된 값 노출 방지.
 */
export function useNow(): number {
  return useSyncExternalStore(
    clockSubscribe,
    clockGetSnapshot,
    clockGetServerSnapshot,
  );
}
