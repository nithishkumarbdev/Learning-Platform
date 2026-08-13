import { useEffect, useState, useCallback } from "react";

type Listener = (value: unknown) => void;

// Shared per-key cache so that every component using the same storage key sees
// the same value. Without this, two components reading `los_progress_v1` keep
// independent copies and the last one to write silently discards the other's
// updates.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

function subscribe(key: string, fn: Listener) {
  const set = listeners.get(key) ?? new Set<Listener>();
  set.add(fn);
  listeners.set(key, set);
  return () => {
    set.delete(fn);
  };
}

function publish(key: string, value: unknown) {
  cache.set(key, value);
  listeners.get(key)?.forEach((fn) => fn(value));
}

function read<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw !== null ? (JSON.parse(raw) as T) : initial;
    cache.set(key, parsed);
    return parsed;
  } catch {
    // corrupt or unavailable storage – fall back to the default
    return initial;
  }
}

/**
 * State persisted to localStorage and shared across every hook using the same
 * key. The stored value is read after mount so server-rendered markup matches
 * the first client render.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setLocal] = useState<T>(initial);

  useEffect(() => {
    setLocal(read(key, initial));
    return subscribe(key, (next) => setLocal(next as T));
    // `initial` is a default only; re-subscribing on identity change is noise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = cache.has(key) ? (cache.get(key) as T) : value;
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      publish(key, resolved);
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage full or blocked – nothing useful to do here
      }
    },
    [key, value],
  );

  return [value, setValue] as const;
}

// Progress store
export type ProgressMap = Record<string, boolean>; // dayId.taskId -> done
export type NotesMap = Record<string, string>; // dayId -> markdown notes
export type SettingsState = {
  mode: "beginner" | "normal";
  pace: "slow" | "normal" | "fast";
  startDate: string | null;
};

const PROG_KEY = "los_progress_v1";
const NOTE_KEY = "los_notes_v1";
const SET_KEY = "los_settings_v1";
const XP_KEY = "los_xp_v1";
const RES_KEY = "los_resources_v1";

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<ProgressMap>(PROG_KEY, {});
  const toggle = useCallback(
    (id: string) => setProgress((p) => ({ ...p, [id]: !p[id] })),
    [setProgress],
  );
  return { progress, setProgress, toggle };
}

export function useNotes() {
  return useLocalStorage<NotesMap>(NOTE_KEY, {});
}

export function useSettings() {
  return useLocalStorage<SettingsState>(SET_KEY, {
    mode: "normal",
    pace: "normal",
    startDate: null,
  });
}

export function useXP() {
  return useLocalStorage<{ xp: number; streak: number; lastDay: string | null }>(XP_KEY, {
    xp: 0,
    streak: 0,
    lastDay: null,
  });
}

export function useResourceStatus() {
  return useLocalStorage<Record<string, "todo" | "doing" | "done">>(RES_KEY, {});
}

export function levelFromXP(xp: number) {
  if (xp >= 2000) return { level: 5, label: "Job Ready" };
  if (xp >= 1200) return { level: 4, label: "Intermediate" };
  if (xp >= 700) return { level: 3, label: "Project Ready" };
  if (xp >= 300) return { level: 2, label: "Builder" };
  return { level: 1, label: "Beginner" };
}
