/**
 * HTMLAudioElement volume 페이드 헬퍼.
 * requestAnimationFrame 기반으로 setInterval 보다 매끄럽고 정확.
 *
 * Web Audio API (GainNode) 대신 plain audio element 를 쓰는 이유:
 * - 트랙 1개 + loop 만 필요한 단순 시나리오라 AudioContext 셋업 비용 비효율
 * - iOS Safari 의 AudioContext suspend 동작 회피 — audio element 는 user
 *   gesture 만 만족하면 바로 재생, AudioContext 는 추가 resume() 필요
 *
 * 모듈 단위 단일 활성 rAF 모델: fadeIn/fadeOut 이 동시 실행되면 양쪽이
 * `audio.volume` 에 교대로 쓰면서 부동소수점 오차 누적 + Chrome 의
 * `[0, 1]` 범위 검증 위반 (-0.00233 같은) 으로 IndexSizeError 발생. 새
 * fade 시작 시 이전 rAF 를 cancel + 모든 write 를 [0, 1] 로 clamp.
 */

const DEFAULT_DURATION = 300;

let activeRafId: number | null = null;

function cancelActive() {
  if (activeRafId !== null) {
    cancelAnimationFrame(activeRafId);
    activeRafId = null;
  }
}

function clampVolume(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

/** 0 → 1 fade-in. duration 동안 volume 을 0 에서 1 까지 ramp. */
export function fadeIn(
  audio: HTMLAudioElement,
  duration: number = DEFAULT_DURATION,
): void {
  cancelActive();
  audio.volume = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    audio.volume = clampVolume(t);
    if (t < 1) {
      activeRafId = requestAnimationFrame(tick);
    } else {
      activeRafId = null;
    }
  };
  activeRafId = requestAnimationFrame(tick);
}

/** 현재 volume → 0 fade-out 후 pause. duration 종료 시 onComplete 호출. */
export function fadeOutAndPause(
  audio: HTMLAudioElement,
  duration: number = DEFAULT_DURATION,
  onComplete?: () => void,
): void {
  cancelActive();
  const startVolume = audio.volume;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    audio.volume = clampVolume(startVolume * (1 - t));
    if (t < 1) {
      activeRafId = requestAnimationFrame(tick);
    } else {
      activeRafId = null;
      audio.pause();
      onComplete?.();
    }
  };
  activeRafId = requestAnimationFrame(tick);
}
