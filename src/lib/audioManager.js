import { useSyncExternalStore } from "react";

/**
 * Tiny shared store for the article audio players:
 *  - only one article plays at a time (starting one pauses the previous),
 *  - volume / mute are shared by every card and remembered between visits.
 */

const STORAGE_KEY = "siftnews-audio";
const DEFAULT_VOLUME = 0.8;

function load() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    const volume = typeof raw.volume === "number" ? Math.min(1, Math.max(0, raw.volume)) : DEFAULT_VOLUME;
    return { volume, muted: Boolean(raw.muted) };
  } catch {
    return { volume: DEFAULT_VOLUME, muted: false };
  }
}

let state = typeof window === "undefined" ? { volume: DEFAULT_VOLUME, muted: false } : load();
let current = null; // the HTMLAudioElement that is currently playing
const listeners = new Set();

function commit(next) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — volume just won't be remembered */
  }
  listeners.forEach((cb) => cb());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;

export function useAudioSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setVolume(volume) {
  const v = Math.min(1, Math.max(0, volume));
  commit({ volume: v, muted: v === 0 });
}

export function toggleMute() {
  if (state.muted && state.volume === 0) commit({ volume: DEFAULT_VOLUME, muted: false });
  else commit({ ...state, muted: !state.muted });
}

// Call right before play(): pauses whichever other article was playing.
export function claimPlayback(el) {
  if (current && current !== el) current.pause();
  current = el;
}

export function releasePlayback(el) {
  if (current === el) current = null;
}
