import type { Trade } from "@/types";
import { POPULAR_PAIRS, CRYPTO_PAIRS, FOREX_PAIRS } from "@/lib/popular-pairs";

/**
 * Returns unique pairs from trades with counts, sorted by frequency (most-used first).
 */
export function getUniquePairsByFrequency(trades: Trade[]): { pair: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of trades) {
    const p = (t.pair || "").trim();
    if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count);
}

/** Grouped suggestions: Recent (from trades), Crypto, FOREX. */
export type PairSuggestionsGroup = { label: string; pairs: string[] };

const DEFAULT_MAX_PER_SECTION = 6;

/**
 * Suggests pairs grouped by category: Recent (your trades), Crypto, FOREX.
 * Prefix match on query. User can still enter any custom pair.
 */
export function getPairSuggestionsGrouped(
  trades: Trade[],
  query: string,
  options?: { maxPerSection?: number }
): PairSuggestionsGroup[] {
  const maxPer = options?.maxPerSection ?? DEFAULT_MAX_PER_SECTION;
  const q = query.trim().toLowerCase();
  const fromTrades = getUniquePairsByFrequency(trades).map((x) => x.pair);
  const matchesQuery = (p: string) => !q || p.toLowerCase().startsWith(q);
  const recentPairsNormalized = new Set<string>();

  const recent: string[] = [];
  for (const p of fromTrades) {
    if (!matchesQuery(p) || recent.length >= maxPer) continue;
    const key = p.toUpperCase();
    if (recentPairsNormalized.has(key)) continue;
    recentPairsNormalized.add(key);
    recent.push(p);
  }

  const crypto: string[] = [];
  for (const p of CRYPTO_PAIRS) {
    if (!matchesQuery(p) || crypto.length >= maxPer) continue;
    if (recentPairsNormalized.has(p.toUpperCase())) continue;
    crypto.push(p);
  }

  const forex: string[] = [];
  for (const p of FOREX_PAIRS) {
    if (!matchesQuery(p) || forex.length >= maxPer) continue;
    if (recentPairsNormalized.has(p.toUpperCase())) continue;
    forex.push(p);
  }

  const groups: PairSuggestionsGroup[] = [];
  if (recent.length > 0) groups.push({ label: "Recent", pairs: recent });
  if (crypto.length > 0) groups.push({ label: "Crypto", pairs: crypto });
  if (forex.length > 0) groups.push({ label: "FOREX", pairs: forex });
  return groups;
}

/**
 * Flat list of suggestions (legacy). Uses grouped under the hood.
 */
export function getPairSuggestions(
  trades: Trade[],
  query: string,
  options?: { maxSuggestions?: number }
): string[] {
  const grouped = getPairSuggestionsGrouped(trades, query, {
    maxPerSection: Math.ceil((options?.maxSuggestions ?? 10) / 3),
  });
  return grouped.flatMap((g) => g.pairs);
}
