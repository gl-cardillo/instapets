import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth, useCanWrite } from "../auth/AuthContext";
import { getSavedIds, setSaved } from "../services/saves";
import { reportError } from "../utils/alerts";

// one shared list per signed-in user, so every bookmark stays in sync
let owner: string | null = null;
let ids: string[] = [];
const listeners = new Set<() => void>();
const NONE: string[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(username: string) {
  if (owner === username) return;
  owner = username;
  ids = [];
  emit();
  getSavedIds(username)
    .then((loaded) => {
      if (owner !== username) return;
      ids = loaded;
      emit();
    })
    .catch(console.error);
}

// for tests; switching user reloads on its own
export function forgetSaved() {
  owner = null;
  ids = [];
  emit();
}

// the signed-in user's saved post ids, oldest saved first
export function useSavedIds(): string[] {
  const { profile } = useAuth();
  const username = profile?.username ?? null;
  useEffect(() => {
    if (username) load(username);
  }, [username]);
  const current = useSyncExternalStore(subscribe, () => ids);
  return username && owner === username ? current : NONE;
}

// whether a post is saved, and a toggle that updates at once
export function useSaved(postId: string) {
  const canWrite = useCanWrite();
  const saved = useSavedIds().includes(postId);

  const toggle = useCallback(async () => {
    const me = canWrite();
    if (!me) return;
    const before = ids;
    ids = saved ? ids.filter((id) => id !== postId) : [...ids, postId];
    emit();
    try {
      await setSaved(me.username, postId, !saved);
    } catch (error) {
      ids = before;
      emit();
      reportError(error);
    }
  }, [canWrite, postId, saved]);

  return { saved, toggle };
}
