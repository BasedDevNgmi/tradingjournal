"use client";

import { USD_NEWS_EVENTS } from "@/lib/usd-news-events";

/**
 * Returns the static list of USD high-impact news event titles.
 * User can still type any event manually.
 */
export function useUsdNewsEvents() {
  return {
    events: USD_NEWS_EVENTS,
    loading: false,
    loadOnce: () => {},
    refresh: () => {},
  };
}
