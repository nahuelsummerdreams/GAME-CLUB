"use client";
import { useSyncExternalStore } from "react";
import type { PlayerProfile } from "@/types/player";
import { EMPTY_PROGRESS, loadProfile, loadProgress, saveProfile, saveProgress, type Progress } from "@/lib/progression";
import { audio, type AudioSettings } from "@/lib/audio";

export interface AppState { profile: PlayerProfile; progress: Progress }

export const DEFAULT_PROFILE: PlayerProfile = { nickname: "Little Elf", avatar: "holly", favoriteCharacter: "santa", createdAt: 0 };
const SERVER: AppState = { profile: DEFAULT_PROFILE, progress: EMPTY_PROGRESS };
const DEFAULT_AUDIO: AudioSettings = { musicOn: true, sfxOn: true, musicVolume: 0.5, sfxVolume: 0.8 };

let state: AppState | null = null;
const listeners = new Set<() => void>();

function getState(): AppState {
  if (!state) {
    audio.init();
    state = { profile: loadProfile() ?? DEFAULT_PROFILE, progress: loadProgress() };
  }
  return state;
}

const subscribe = (fn: () => void) => { listeners.add(fn); return () => void listeners.delete(fn); };

export function setProfile(profile: PlayerProfile): void {
  state = { ...getState(), profile };
  saveProfile(profile);
  listeners.forEach((l) => l());
}

export function setProgress(progress: Progress): void {
  state = { ...getState(), progress };
  saveProgress(progress);
  listeners.forEach((l) => l());
}

export const getProgress = (): Progress => getState().progress;

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => SERVER);
}

export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(
    audio.subscribe,
    () => { getState(); return audio.settings; },
    () => DEFAULT_AUDIO,
  );
}
