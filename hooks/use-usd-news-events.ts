"use client";

import * as React from "react";
import {
  loadUsdNewsEventsFromStorage,
  saveUsdNewsEventsToStorage,
  fetchUsdNewsEventsFromApi,
} from "@/lib/usd-news-events";

/**
 * Returns the list of USD high-impact news event titles.
 * Loads from localStorage first; if empty, fetches once from the API and saves.
 * User can still type any event manually.
 */
export function useUsdNewsEvents() {
  const [events, setEvents] = React.useState<string[]>(() =>
    loadUsdNewsEventsFromStorage()
  );
  const [loading, setLoading] = React.useState(false);
  const initialFetchDone = React.useRef(false);

  const loadOnce = React.useCallback(async () => {
    const stored = loadUsdNewsEventsFromStorage();
    if (stored.length > 0) {
      setEvents(stored);
      return;
    }
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    setLoading(true);
    try {
      const titles = await fetchUsdNewsEventsFromApi();
      if (titles.length > 0) {
        saveUsdNewsEventsToStorage(titles);
        setEvents(titles);
      }
    } catch {
      // Keep events empty; user can type manually
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const titles = await fetchUsdNewsEventsFromApi();
      if (titles.length > 0) {
        saveUsdNewsEventsToStorage(titles);
        setEvents(titles);
      }
    } catch {
      // Leave existing list unchanged
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, loadOnce, refresh };
}
