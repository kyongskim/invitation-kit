"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { config as defaultConfig } from "@/invitation.config";
import type { InvitationConfig } from "@/invitation.config";

/**
 * v2.0 editor 의 단일 store. ADR 010 결정 3 (state 관리 = Zustand + persist).
 *
 * - `config` 만 localStorage 에 persist. GitHub 토큰은 메모리만 (partialize 제외)
 *   — v2.0 정체성 ("우리 데이터 보관 X") 의 client 단 미러
 * - `defaultConfig` 는 `invitation.config.ts` 의 기존 sample 값 (김철수♥이영희).
 *   editor 첫 진입 시 데모 청첩장이 preview 에 보이고 form 으로 수정
 * - `setField` 는 top-level 키 단위 갱신. 이후 호흡에서 nested path 갱신
 *   (예: `setNested("gallery.photos[3].src", url)`) 헬퍼 추가 가능
 */
type EditorState = {
  config: InvitationConfig;
  github: {
    token: string | null;
    user: string | null;
  };
  setField: <K extends keyof InvitationConfig>(
    key: K,
    value: InvitationConfig[K],
  ) => void;
  setConfig: (config: InvitationConfig) => void;
  setGithub: (github: { token: string | null; user: string | null }) => void;
  reset: () => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      github: { token: null, user: null },
      setField: (key, value) =>
        set((state) => ({ config: { ...state.config, [key]: value } })),
      setConfig: (config) => set({ config }),
      setGithub: (github) => set({ github }),
      reset: () =>
        set({ config: defaultConfig, github: { token: null, user: null } }),
    }),
    {
      name: "invitation-kit-editor",
      partialize: (state) => ({ config: state.config }),
    },
  ),
);
