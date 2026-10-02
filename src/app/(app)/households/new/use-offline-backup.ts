// Keeps a copy of the form in localStorage while the agent types, so a refresh,
// a flat battery or a lost signal never costs them their work. The database is
// still the record; this is only the safety net between saves.

"use client";

import { useCallback, useEffect, useState } from "react";

const backupIntervalMs = 2_000;
const retryIntervalMs = 10_000;

export function backupKey(draftId: string): string {
  return `census-draft-${draftId}`;
}

export function readBackup<T>(key: string): T | null {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? null : (JSON.parse(stored) as T);
  } catch {
    // Private browsing, blocked storage or corrupt JSON: no backup to offer.
    return null;
  }
}

export function useOfflineBackup<T>(key: string, value: T) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage can be full or blocked; the periodic database save still runs.
      }
    }, backupIntervalMs);

    return () => clearInterval(timer);
  }, [key, value]);

  useEffect(() => {
    const update = () => setIsOnline(window.navigator.onLine);

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const clearBackup = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  }, [key]);

  return { isOnline, clearBackup };
}

// Re-runs a failed save while the connection is down.
export function useRetryWhilePending(pending: boolean, retry: () => void) {
  useEffect(() => {
    if (!pending) {
      return;
    }

    const timer = setInterval(retry, retryIntervalMs);
    return () => clearInterval(timer);
  }, [pending, retry]);
}
