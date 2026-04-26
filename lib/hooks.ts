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
 *
 * React 공식 docs 의 `useSyncExternalStore` 시계 예제 패턴 그대로.
 * getSnapshot 이 호출마다 `Date.now()` 반환하지만 React 18+ 의 tearing
 * protection 이 같은 render cycle 안에선 일관 값으로 처리. setInterval
 * tick 이 callback 으로 React 에 알려 다음 render 에서 새 값 노출.
 *
 * **함정 — subscribe 안에서 callback 동기 호출 금지** (React 가 infinite
 * loop 위험으로 bail-out → 화면 freeze). 첫 render 에선 server snapshot
 * 0 이 나오므로 호출측에서 `now === 0` 가드로 hydration 직후 잘못된 값
 * 노출 방지.
 */
export function useNow(): number {
  return useSyncExternalStore(
    clockSubscribe,
    clockGetSnapshot,
    clockGetServerSnapshot,
  );
}
