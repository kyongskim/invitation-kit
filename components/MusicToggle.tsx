"use client";

import { useRef, useState } from "react";

import { fadeIn, fadeOutAndPause } from "@/lib/audio";

type Props = {
  src: string;
};

type PlaybackState = "paused" | "playing" | "error";

/**
 * 우상단 floating 음악 토글. 첫 클릭 = 재생 (fade-in 300ms),
 * 다시 클릭 = 정지 (fade-out 300ms 후 pause). 자동재생 시도 안 함 —
 * iOS Safari 무음 모드 + Low Power Mode + autoplay 정책 변수가 너무
 * 많아 시도 자체가 음수 ROI (CLAUDE.md 4번 원칙).
 *
 * iOS Safari 호환 패턴 (실기기 검증 누적):
 * - **JSX `<audio>` 태그 폐기, 첫 click 시 `new Audio(src)` 로 lazy 생성** —
 *   HTML `<audio>` element 는 SSR/hydration/preload 변수가 많아 iOS 가
 *   "preview only" 로 취급하는 정황. JS-constructed Audio 는 user gesture
 *   안에서 만들어지면 fetch + play 가 한 번에 트리거. 동일 .mp3 가 주소창
 *   직접 입력 시 iOS 네이티브 플레이어로 잘 재생되는데 element 내부에선
 *   readyState 1 에서 멈추는 비대칭이 결정적 신호.
 * - async/await 대신 `.then()` 체인 — async 함수 리턴이 즉시라 일부 webkit
 *   빌드에서 user gesture lifetime 흔들림. 동기 호출 유지
 * - 낙관적 setState — play() Promise resolve 전에 버튼 즉시 갱신, 실패 시
 *   catch 로 보정
 * - audio.volume 은 iOS read-only — fade 는 데스크톱·Android 에서만 효과
 */
export function MusicToggle({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlaybackState>("paused");

  const handleClick = () => {
    let audio = audioRef.current;
    if (!audio) {
      // user gesture 안에서 첫 생성 — iOS 가 "사용자가 직접 트리거한
      // 미디어" 로 인식하게 하는 핵심.
      audio = new Audio(src);
      audio.loop = true;
      audioRef.current = audio;
    }

    if (audio.paused) {
      // 낙관적 — Promise resolve 기다리지 않고 즉시 버튼 갱신.
      setState("playing");
      audio
        .play()
        .then(() => fadeIn(audio!))
        .catch((err) => {
          console.error("[music] play failed", err);
          setState("error");
        });
    } else {
      fadeOutAndPause(audio, 300, () => setState("paused"));
    }
  };

  const isPlaying = state === "playing";
  const isError = state === "error";
  const label = isError
    ? "음악 재생 실패 (다시 시도)"
    : isPlaying
      ? "음악 일시정지"
      : "음악 재생";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isPlaying}
      className={`fixed top-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
        isPlaying
          ? "bg-text border-text text-white"
          : "border-accent text-text bg-white/90 hover:bg-white"
      }`}
    >
      <SpeakerIcon playing={isPlaying} />
    </button>
  );
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      {playing ? (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      ) : (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      )}
    </svg>
  );
}
