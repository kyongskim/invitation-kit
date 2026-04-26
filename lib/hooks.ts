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

// `useNow` (시계 hook) 은 useSyncExternalStore 패턴이 production 빌드에서
// hydration transition 시 client snapshot 반영 불일치를 보였던 사례로
// 폐기. DDayBadge 가 useState lazy init + setInterval 로 직접 관리.
