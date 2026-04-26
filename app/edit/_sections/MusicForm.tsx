"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 배경 음악. config.music 은 optional — enabled 토글로 노출 제어.
 *
 * 음원 파일 업로드는 본 호흡에서 제외 — OSS 라이선스 제약 (CC0 / Public
 * Domain / 직접 보유) + audio binary GitHub commit 패턴은 ADR 010 의
 * 이미지 commit 미러로 가능하나 별도 호흡. 우선 form 단에서 path/URL
 * 입력 + enabled toggle.
 *
 * iOS 무음 모드 (ringer 스위치 OFF) 에선 들리지 않음 — 사용자 안내.
 */
export function MusicForm() {
  const music = useEditorStore((s) => s.config.music);
  const setField = useEditorStore((s) => s.setField);

  const enabled = music?.enabled ?? false;
  const src = music?.src ?? "";

  function setEnabled(next: boolean) {
    if (next) {
      if (!src) return; // src 없이 enabled 만 체크 차단 — UI 상 disabled 로도 막혀있지만 방어적
      setField("music", { enabled: true, src });
    } else {
      setField("music", src ? { enabled: false, src } : undefined);
    }
  }

  function setSrc(next: string) {
    if (!next && !enabled) {
      setField("music", undefined);
      return;
    }
    setField("music", { enabled, src: next });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">배경 음악</h2>

      <Field
        label="음원 경로 또는 URL"
        value={src}
        onChange={setSrc}
        placeholder="/audio/wedding.mp3"
        hint="public/audio/ 기준 경로 또는 절대 URL"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          disabled={!src}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className={src ? "text-text" : "text-secondary/50"}>
          배경 음악 사용 {!src && "(경로 입력 후 활성화)"}
        </span>
      </label>

      <p className="text-secondary/70 text-xs leading-relaxed">
        음원 파일은 OSS 라이선스 제약으로 ship 되지 않습니다. 샘플 경로
        (&quot;/audio/wedding.mp3&quot;) 를 그대로 두면 재생 시 404 에러
        (&quot;Failed to load because no supported source was found&quot;) 가
        발생합니다. 본인 음원 (CC0 · Public Domain · 직접 라이선스 보유) 을 본인
        GitHub repo 의 public/audio/ 에 직접 commit 후 위 경로 갱신. 사용자가
        버튼을 눌러야만 재생 (iOS 무음 모드 ringer OFF 에선 들리지 않음).
      </p>
    </section>
  );
}
