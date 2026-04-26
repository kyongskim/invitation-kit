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

const clockSubscribe = (callback: () => void) => {
  const id = window.setInterval(callback, 1000);
  return () => window.clearInterval(id);
};
const clockGetSnapshot = () => Date.now();
const clockGetServerSnapshot = () => 0;

/**
 * 1초 간격으로 갱신되는 현재 timestamp.
 * useSyncExternalStore 패턴 — useEffect + setState 로 setInterval 거는
 * 패턴 대비 React 19 `react-hooks/set-state-in-effect` 룰 안전 + SSR
 * 결정성 (서버는 항상 0 반환, 클라이언트 hydration 후에만 실 시각 노출).
 */
export function useNow(): number {
  return useSyncExternalStore(
    clockSubscribe,
    clockGetSnapshot,
    clockGetServerSnapshot,
  );
}
