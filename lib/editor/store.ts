"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { config as defaultConfig } from "@/invitation.config";
import type { InvitationConfig } from "@/invitation.config.types";

/**
 * v2.0 editor 의 단일 store. ADR 010 결정 3 (state 관리 = Zustand + persist).
 *
 * persist 정책:
 * - `config` · `publishedRepo` 만 localStorage 에 persist. 새로고침 시 복원
 *   되어야 자연스러운 사용자 경험 (form 작성 중 reload + 첫 publish 후 이미지
 *   추가하는 흐름)
 * - `github.token` 은 메모리만 (partialize 제외) — ADR 010·011 의 "데이터 보관
 *   X" 약속의 client 단 미러. 새로고침 시 재연결 필요
 *
 * `publishedRepo` 도입 — Phase 3-b: 첫 publish 후 본인 repo 정보 보유.
 * 이미지 업로드 (`uploadImage`) · "변경사항 다시 commit" 흐름이 이 정보로
 * 동작.
 */
type PublishedRepo = {
  /** repo owner (보통 사용자 username) */
  owner: string;
  /** repo name */
  name: string;
  /** GitHub web UI URL */
  htmlUrl: string;
  /** 기본 branch ('main' 일반적) */
  branch: string;
};

type EditorState = {
  config: InvitationConfig;
  github: {
    token: string | null;
    user: string | null;
  };
  publishedRepo: PublishedRepo | null;
  setField: <K extends keyof InvitationConfig>(
    key: K,
    value: InvitationConfig[K],
  ) => void;
  setConfig: (config: InvitationConfig) => void;
  setGithub: (github: { token: string | null; user: string | null }) => void;
  setPublishedRepo: (repo: PublishedRepo | null) => void;
  reset: () => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      github: { token: null, user: null },
      publishedRepo: null,
      setField: (key, value) =>
        set((state) => ({ config: { ...state.config, [key]: value } })),
      setConfig: (config) => set({ config }),
      setGithub: (github) => set({ github }),
      setPublishedRepo: (publishedRepo) => set({ publishedRepo }),
      reset: () =>
        set({
          config: defaultConfig,
          github: { token: null, user: null },
          publishedRepo: null,
        }),
    }),
    {
      name: "invitation-kit-editor",
      version: 1,
      /**
       * v0 → v1 migration: sample placeholder `/audio/wedding.mp3` + enabled
       * true 가 localStorage 에 stuck 인 사용자 자동 회수. 음원 파일이 OSS 에
       * ship 안 되는데 enabled 만 true 면 매번 404 에러. 명시 안내로
       * enabled false reset.
       */
      migrate: (persistedState, version) => {
        if (
          version < 1 &&
          persistedState &&
          typeof persistedState === "object"
        ) {
          const state = persistedState as {
            config?: { music?: { enabled?: boolean; src?: string } };
          };
          if (
            state.config?.music?.enabled === true &&
            state.config?.music?.src === "/audio/wedding.mp3"
          ) {
            return {
              ...state,
              config: {
                ...state.config,
                music: { ...state.config.music, enabled: false },
              },
            };
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        config: state.config,
        publishedRepo: state.publishedRepo,
      }),
    },
  ),
);
