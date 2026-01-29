"use client";

import * as React from "react";
import { filterTradesByTimeFilter } from "@/lib/utils";
import { getQualityLevel, isLeakSetup } from "@/lib/trade-utils";
import type { Trade } from "@/types";

function getKillzone(dateStr: string) {
  const date = new Date(dateStr);
  const utcHour = date.getUTCHours();
  const nyHour = (utcHour - 5 + 24) % 24;
  if (nyHour >= 2 && nyHour < 5) return "London Open";
  if (nyHour >= 7 && nyHour < 10) return "NY Open";
  if (nyHour >= 20 && nyHour < 24) return "Asia Open";
  return "Outside";
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function getWeekday(dateStr: string): (typeof WEEKDAYS)[number] | null {
  const day = new Date(dateStr).getDay();
  if (day === 0 || day === 6) return null;
  return WEEKDAYS[day - 1];
}

const MIN_TRADES_FOR_LABEL = 2;

export type KillzoneStat = { name: string; totalR: number; wins: number; count: number; winRate: number };
export type DayOfWeekStat = { name: string; totalR: number; wins: number; count: number; winRate: number };
export type NewsDayStat = { name: string; count: number; totalR: number; winRate: number };
export type NewsEventStat = { name: string; totalR: number; wins: number; count: number; winRate: number };
export type NewsEventTradeVsAvoid = {
  trade: NewsEventStat[];
  avoid: NewsEventStat[];
  needMore: NewsEventStat[];
};
export type PlanAdherenceStats = {
  followed: { count: number; totalR: number; winRate: number };
  notFollowed: { count: number; totalR: number; winRate: number };
};
export type PsychoTagStat = { name: string; count: number; totalR: number; winRate: number };
export type PlaybookStats = {
  highQualityWR: number;
  lowQualityWR: number;
  highCount: number;
  lowCount: number;
  leakR: number;
};
export type ExecutionStats = { targetHitRate: number; avgCapture: number; winCount: number };
export type HudMetrics = {
  expectancy: number;
  profitFactor: number;
  winRate: number;
  totalR: number;
  totalTrades: number;
  drawdown: number;
};

export function useAnalytics(trades: Trade[], timeFilter: string) {
  const filteredTrades = React.useMemo(
    () => filterTradesByTimeFilter(trades, timeFilter),
    [trades, timeFilter]
  );

  const closedTrades = React.useMemo(
    () =>
      filteredTrades.filter(
        (t) => t.status !== "Open" && t.status !== "Missed"
      ),
    [filteredTrades]
  );

  const hudMetrics = React.useMemo((): HudMetrics => {
    const wins = closedTrades.filter((t) => t.status === "Win");
    const losses = closedTrades.filter((t) => t.status === "Loss");
    const totalWinsR = wins.reduce((acc, t) => acc + (t.rrRealized || 0), 0);
    const totalLossesR = Math.abs(
      losses.reduce((acc, t) => acc + (t.rrRealized || 0), 0)
    );
    const profitFactor =
      totalLossesR === 0 ? (totalWinsR > 0 ? totalWinsR : 0) : totalWinsR / totalLossesR;
    const totalR = closedTrades.reduce(
      (acc, t) => acc + (t.rrRealized || 0),
      0
    );
    const expectancy =
      closedTrades.length > 0 ? totalR / closedTrades.length : 0;
    const winRate =
      closedTrades.length > 0
        ? (wins.length / closedTrades.length) * 100
        : 0;
    const sorted = [...closedTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let peak = 0,
      drawdown = 0,
      cum = 0;
    for (const t of sorted) {
      cum += t.rrRealized || 0;
      peak = Math.max(peak, cum);
      drawdown = Math.max(drawdown, peak - cum);
    }
    return {
      expectancy,
      profitFactor,
      winRate,
      totalR,
      totalTrades: closedTrades.length,
      drawdown,
    };
  }, [closedTrades]);

  const killzoneStats = React.useMemo((): KillzoneStat[] => {
    const stats: Record<string, { totalR: number; wins: number; count: number }> = {
      "London Open": { totalR: 0, wins: 0, count: 0 },
      "NY Open": { totalR: 0, wins: 0, count: 0 },
      "Asia Open": { totalR: 0, wins: 0, count: 0 },
      Outside: { totalR: 0, wins: 0, count: 0 },
    };
    closedTrades.forEach((t) => {
      const kz = getKillzone(t.date);
      stats[kz].count++;
      stats[kz].totalR += t.rrRealized || 0;
      if (t.status === "Win") stats[kz].wins++;
    });
    return ["London Open", "NY Open", "Asia Open", "Outside"].map((name) => ({
      name,
      ...stats[name],
      winRate:
        stats[name].count > 0
          ? (stats[name].wins / stats[name].count) * 100
          : 0,
    }));
  }, [closedTrades]);

  const dayOfWeekStats = React.useMemo((): DayOfWeekStat[] => {
    const stats: Record<
      (typeof WEEKDAYS)[number],
      { totalR: number; wins: number; count: number }
    > = {
      Monday: { totalR: 0, wins: 0, count: 0 },
      Tuesday: { totalR: 0, wins: 0, count: 0 },
      Wednesday: { totalR: 0, wins: 0, count: 0 },
      Thursday: { totalR: 0, wins: 0, count: 0 },
      Friday: { totalR: 0, wins: 0, count: 0 },
    };
    closedTrades.forEach((t) => {
      const day = getWeekday(t.date);
      if (day) {
        stats[day].count++;
        stats[day].totalR += t.rrRealized || 0;
        if (t.status === "Win") stats[day].wins++;
      }
    });
    return WEEKDAYS.map((name) => ({
      name,
      ...stats[name],
      winRate:
        stats[name].count > 0
          ? (stats[name].wins / stats[name].count) * 100
          : 0,
    }));
  }, [closedTrades]);

  const newsDayStats = React.useMemo((): NewsDayStat[] => {
    const onNews = closedTrades.filter((t) => t.isNewsDay === true);
    const nonNews = closedTrades.filter((t) => t.isNewsDay !== true);
    const wr = (ts: Trade[]) =>
      ts.length > 0
        ? (ts.filter((t) => t.status === "Win").length / ts.length) * 100
        : 0;
    const totalR = (ts: Trade[]) =>
      ts.reduce((a, t) => a + (t.rrRealized || 0), 0);
    return [
      {
        name: "On news days",
        count: onNews.length,
        totalR: totalR(onNews),
        winRate: wr(onNews),
      },
      {
        name: "Non-news days",
        count: nonNews.length,
        totalR: totalR(nonNews),
        winRate: wr(nonNews),
      },
    ];
  }, [closedTrades]);

  const newsEventStats = React.useMemo((): NewsEventStat[] => {
    const byEvent: Record<string, { totalR: number; wins: number; count: number }> = {};
    closedTrades
      .filter((t) => t.isNewsDay === true)
      .forEach((t) => {
        const key = (t.newsEvent?.trim() || "") || "No event";
        if (!byEvent[key]) byEvent[key] = { totalR: 0, wins: 0, count: 0 };
        byEvent[key].count++;
        byEvent[key].totalR += t.rrRealized || 0;
        if (t.status === "Win") byEvent[key].wins++;
      });
    return Object.entries(byEvent)
      .filter(([, s]) => s.count > 0)
      .map(([name, s]) => ({
        name,
        ...s,
        winRate: s.count > 0 ? (s.wins / s.count) * 100 : 0,
      }))
      .sort((a, b) => b.totalR - a.totalR);
  }, [closedTrades]);

  const newsEventTradeVsAvoid = React.useMemo((): NewsEventTradeVsAvoid => {
    const trade = newsEventStats.filter(
      (r) =>
        r.name !== "No event" &&
        r.count >= MIN_TRADES_FOR_LABEL &&
        r.totalR >= 0
    );
    const avoid = newsEventStats.filter(
      (r) =>
        r.name !== "No event" &&
        r.count >= MIN_TRADES_FOR_LABEL &&
        r.totalR < 0
    );
    const needMore = newsEventStats.filter(
      (r) => r.name === "No event" || r.count < MIN_TRADES_FOR_LABEL
    );
    return {
      trade: trade.sort((a, b) => b.totalR - a.totalR),
      avoid: avoid.sort((a, b) => a.totalR - b.totalR),
      needMore,
    };
  }, [newsEventStats]);

  const planAdherenceStats = React.useMemo((): PlanAdherenceStats => {
    const followed = closedTrades.filter((t) => t.followedPlan === true);
    const notFollowed = closedTrades.filter((t) => t.followedPlan === false);
    const wr = (ts: Trade[]) =>
      ts.length > 0
        ? (ts.filter((t) => t.status === "Win").length / ts.length) * 100
        : 0;
    const totalR = (ts: Trade[]) =>
      ts.reduce((a, t) => a + (t.rrRealized || 0), 0);
    return {
      followed: {
        count: followed.length,
        totalR: totalR(followed),
        winRate: wr(followed),
      },
      notFollowed: {
        count: notFollowed.length,
        totalR: totalR(notFollowed),
        winRate: wr(notFollowed),
      },
    };
  }, [closedTrades]);

  const psychoTagStats = React.useMemo((): PsychoTagStat[] => {
    const byTag: Record<string, { count: number; totalR: number; wins: number }> = {};
    closedTrades.forEach((t) => {
      const tags = t.psychoTags?.length ? t.psychoTags : ["None"];
      tags.forEach((tag) => {
        if (!byTag[tag]) byTag[tag] = { count: 0, totalR: 0, wins: 0 };
        byTag[tag].count++;
        byTag[tag].totalR += t.rrRealized || 0;
        if (t.status === "Win") byTag[tag].wins++;
      });
    });
    return Object.entries(byTag)
      .map(([name, s]) => ({
        name,
        count: s.count,
        totalR: s.totalR,
        winRate: s.count > 0 ? (s.wins / s.count) * 100 : 0,
      }))
      .sort((a, b) => b.totalR - a.totalR);
  }, [closedTrades]);

  const playbookStats = React.useMemo((): PlaybookStats => {
    const highQuality = closedTrades.filter(
      (t) => getQualityLevel(t.confluences) === 3
    );
    const lowQuality = closedTrades.filter(
      (t) => getQualityLevel(t.confluences) === 1
    );
    const leakTrades = closedTrades.filter((t) =>
      isLeakSetup(t.confluences)
    );
    const wr = (ts: Trade[]) =>
      ts.length > 0
        ? (ts.filter((t) => t.status === "Win").length / ts.length) * 100
        : 0;
    const leakR = leakTrades.reduce(
      (acc, t) => acc + (t.rrRealized || 0),
      0
    );
    return {
      highQualityWR: wr(highQuality),
      lowQualityWR: wr(lowQuality),
      highCount: highQuality.length,
      lowCount: lowQuality.length,
      leakR,
    };
  }, [closedTrades]);

  const executionStats = React.useMemo((): ExecutionStats => {
    const wins = closedTrades.filter(
      (t) =>
        t.status === "Win" &&
        t.rrPredicted != null &&
        t.rrRealized != null
    );
    const hitTarget = wins.filter(
      (t) =>
        (t.rrRealized ?? 0) >= (t.rrPredicted ?? 0) * 0.9
    ).length;
    const targetHitRate =
      wins.length > 0 ? (hitTarget / wins.length) * 100 : 0;
    const sumRealized = wins.reduce((a, t) => a + (t.rrRealized ?? 0), 0);
    const sumPredicted = wins.reduce(
      (a, t) => a + (t.rrPredicted ?? 0),
      0
    );
    const avgCapture =
      sumPredicted > 0 ? (sumRealized / sumPredicted) * 100 : 0;
    return { targetHitRate, avgCapture, winCount: wins.length };
  }, [closedTrades]);

  const insightLine = React.useMemo(() => {
    if (closedTrades.length < 3) return null;
    const parts: string[] = [];
    const bestKz = killzoneStats.find(
      (r) => r.name !== "Outside" && r.count >= 2
    );
    if (bestKz) {
      parts.push(
        `Best session: ${bestKz.name} (${bestKz.totalR >= 0 ? "+" : ""}${bestKz.totalR.toLocaleString(undefined, { maximumFractionDigits: 2 })}R, ${bestKz.winRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}% WR)`
      );
    }
    if (newsEventTradeVsAvoid.trade.length > 0) {
      const top = newsEventTradeVsAvoid.trade
        .slice(0, 3)
        .map((r) => r.name)
        .join(", ");
      parts.push(`Trade: ${top}`);
    }
    if (newsEventTradeVsAvoid.avoid.length > 0) {
      const worst = newsEventTradeVsAvoid.avoid
        .slice(0, 3)
        .map((r) => r.name)
        .join(", ");
      parts.push(`Avoid: ${worst}`);
    }
    if (
      planAdherenceStats.followed.count >= 3 &&
      planAdherenceStats.notFollowed.count >= 1
    ) {
      const planInsight =
        planAdherenceStats.followed.winRate >=
        planAdherenceStats.notFollowed.winRate
          ? "Following your plan improves WR"
          : "Review plan adherence";
      parts.push(planInsight);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [
    closedTrades.length,
    killzoneStats,
    newsEventTradeVsAvoid.trade,
    newsEventTradeVsAvoid.avoid,
    planAdherenceStats.followed,
    planAdherenceStats.notFollowed,
  ]);

  const periodLabel =
    timeFilter === "1D"
      ? "Today"
      : timeFilter === "1W"
        ? "Last 7 days"
        : timeFilter === "1M"
          ? "Last 30 days"
          : "All time";

  const hasNoClosedTrades = closedTrades.length === 0;

  return {
    filteredTrades,
    closedTrades,
    periodLabel,
    hasNoClosedTrades,
    hudMetrics,
    killzoneStats,
    dayOfWeekStats,
    newsDayStats,
    newsEventStats,
    newsEventTradeVsAvoid,
    planAdherenceStats,
    psychoTagStats,
    playbookStats,
    executionStats,
    insightLine,
  };
}
