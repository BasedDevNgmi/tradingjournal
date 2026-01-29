const STORAGE_KEY = "trading-journal-usd-events";

export function loadUsdNewsEventsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export function saveUsdNewsEventsToStorage(titles: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
  } catch (e) {
    console.error("Failed to save USD news events to localStorage", e);
  }
}

export async function fetchUsdNewsEventsFromApi(): Promise<string[]> {
  const res = await fetch("/api/calendar/usd-high");
  const data = await res.json();
  const events = Array.isArray(data?.events) ? data.events : [];
  return events
    .map((e: { title?: string }) => (e && typeof e.title === "string" ? e.title : null))
    .filter((t: string | null): t is string => t != null);
}
