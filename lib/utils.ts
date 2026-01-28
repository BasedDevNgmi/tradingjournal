import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, startOfDay, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTradeDate(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM, yyyy");
}

/** "HH:mm" or "HH:mm session" for trade entry time. */
export function formatTradeTime(dateString: string, session?: string | null) {
  const date = new Date(dateString);
  const time = format(date, "HH:mm");
  return session ? `${time} ${session}` : time;
}

export function formatNumber(value: number, decimals: number = 2) {
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: decimals 
  });
}

export function getRRColor(rr: number) {
  if (rr > 0) return "text-emerald-500";
  if (rr < 0) return "text-rose-500";
  return "text-muted-foreground";
}

export function getRRBgColor(rr: number) {
  if (rr > 0) return "bg-emerald-500/10";
  if (rr < 0) return "bg-rose-500/10";
  return "bg-muted";
}

/** Returns the start date for a time filter, or null for "ALL". */
export function getTimeFilterStartDate(timeFilter: string): Date | null {
  if (timeFilter === "ALL") return null;
  const now = new Date();
  if (timeFilter === "1D") return startOfDay(now);
  if (timeFilter === "1W") return startOfDay(subDays(now, 7));
  if (timeFilter === "1M") return startOfDay(subDays(now, 30));
  return null;
}

/** Filters trades to those on or after the time filter start date. */
export function filterTradesByTimeFilter<T extends { date: string }>(
  trades: T[],
  timeFilter: string
): T[] {
  const startDate = getTimeFilterStartDate(timeFilter);
  if (!startDate) return trades;
  return trades.filter((t) => new Date(t.date) >= startDate);
}

export function groupTradesByDate<T extends { date: string }>(trades: T[]) {
  const groups: { [key: string]: T[] } = {};
  
  trades.forEach((trade) => {
    const dateKey = startOfDay(new Date(trade.date)).toISOString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(trade);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((dateKey) => ({
      date: dateKey,
      label: formatTradeDate(dateKey),
      trades: groups[dateKey],
    }));
}
