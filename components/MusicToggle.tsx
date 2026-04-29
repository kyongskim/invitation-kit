"use client";

import { useEffect, useRef, useState } from "react";

import { fadeIn, fadeOutAndPause } from "@/lib/audio";

type Props = {
  src: string;
};

type PlaybackState = "paused" | "playing" | "error";

/**
 * 우상단 floating 음악 토글. 첫 클릭 = 재생 (fade-in 300ms),
 * 다시 클릭 = 정지 (fade-out 300ms 후 pause).
 *
 * **첫 사용자 상호작용 시 autoplay** (2026-04-29 변경) — click / touch /
 * scroll / keydown 중 첫 발화 시 자동 재생. 마운트 즉시 audio.play() 시도는
 * 모바일 브라우저 autoplay 정책에 막히므로 의미 없고, 반대로 사용자
 * 상호작용 안에서의 play() 는 iOS Safari 도 정상 처리. 기존 "토글 클릭만
 * 재생" 정책에서 한 발 양보 — 청첩장 도메인은 BGM 이 분위기 핵심이라
 * 사용자 첫 동작 시점에 자연 재생이 OFF 보다 압도적 정합.
 *
 * iOS Safari 호환 패턴 (실기기 검증 누적):
 * - **JSX `<audio>` 태그 폐기, 첫 user gesture 시 `new Audio(src)` 로 lazy
 *   생성** — HTML `<audio>` element 는 SSR/hydration/preload 변수가 많아
 *   iOS 가 "preview only" 로 취급하는 정황. JS-constructed Audio 는 user
 *   gesture 안에서 만들어지면 fetch + play 가 한 번에 트리거.
 * - async/await 대신 `.then()` 체인 — async 함수 리턴이 즉시라 일부 webkit
 *   빌드에서 user gesture lifetime 흔들림. 동기 호출 유지
 * - 낙관적 setState — play() Promise resolve 전에 버튼 즉시 갱신, 실패 시
 *   catch 로 보정
 * - audio.volume 은 iOS read-only — fade 는 데스크톱·Android 에서만 효과
 */
export function MusicToggle({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initiatedRef = useRef(false);
  const [state, setState] = useState<PlaybackState>("paused");

  const startPlayback = () => {
    let audio = audioRef.current;
    if (!audio) {
      // user gesture 안에서 첫 생성 — iOS 가 "사용자가 직접 트리거한
      // 미디어" 로 인식하게 하는 핵심.
      audio = new Audio(src);
      audio.loop = true;
      audioRef.current = audio;
    }
    setState("playing");
    audio
      .play()
      .then(() => fadeIn(audio!))
      .catch((err) => {
        console.error("[music] play failed", err);
        setState("error");
      });
  };

  // 첫 사용자 상호작용 시 자동 재생. once: true 로 단발 listener.
  useEffect(() => {
    const onFirstInteraction = () => {
      if (initiatedRef.current) return;
      initiatedRef.current = true;
      startPlayback();
    };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("click", onFirstInteraction, opts);
    window.addEventListener("touchstart", onFirstInteraction, opts);
    window.addEventListener("scroll", onFirstInteraction, opts);
    window.addEventListener("keydown", onFirstInteraction, opts);
    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    initiatedRef.current = true;
    const audio = audioRef.current;
    if (!audio) {
      // 토글 첫 클릭이 첫 상호작용인 경우 — startPlayback 이 Audio 생성
      // 부터 처리. 이후 클릭은 아래 paused/playing 분기.
      startPlayback();
      return;
    }

    if (audio.paused) {
      setState("playing");
      audio
        .play()
        .then(() => fadeIn(audio))
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
