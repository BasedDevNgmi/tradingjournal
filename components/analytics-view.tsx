"use client";

import * as React from "react";
import { useTrades } from "@/context/trade-context";
import { EquityChart } from "./equity-chart";
import { cn, formatNumber, filterTradesByTimeFilter } from "../lib/utils";
import { getQualityLevel, isLeakSetup } from "@/lib/trade-utils";
import {
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Brain,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlobalErrorBoundary } from "./ui/error-boundary";

function getKillzone(dateStr: string) {
  const date = new Date(dateStr);
  const utcHour = date.getUTCHours();
  const nyHour = (utcHour - 5 + 24) % 24;
  if (nyHour >= 2 && nyHour < 5) return "London Open";
  if (nyHour >= 7 && nyHour < 10) return "NY Open";
  if (nyHour >= 20 && nyHour < 24) return "Asia Open";
  return "Outside";
}

export function AnalyticsView() {
  const { trades, timeFilter } = useTrades();

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

  const hudMetrics = React.useMemo(() => {
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

  const killzoneStats = React.useMemo(() => {
    const stats: Record<
      string,
      { totalR: number; wins: number; count: number }
    > = {
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
    return ["London Open", "NY Open", "Asia Open", "Outside"].map(
      (name) => ({
        name,
        ...stats[name],
        winRate:
          stats[name].count > 0
            ? (stats[name].wins / stats[name].count) * 100
            : 0,
      })
    );
  }, [closedTrades]);

  const planAdherenceStats = React.useMemo(() => {
    const followed = closedTrades.filter((t) => t.followedPlan === true);
    const notFollowed = closedTrades.filter((t) => t.followedPlan === false);
    const wr = (ts: typeof closedTrades) =>
      ts.length > 0
        ? (ts.filter((t) => t.status === "Win").length / ts.length) * 100
        : 0;
    const totalR = (ts: typeof closedTrades) =>
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

  const psychoTagStats = React.useMemo(() => {
    const byTag: Record<
      string,
      { count: number; totalR: number; wins: number }
    > = {};
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

  const playbookStats = React.useMemo(() => {
    const highQuality = closedTrades.filter(
      (t) => getQualityLevel(t.confluences) === 3
    );
    const lowQuality = closedTrades.filter(
      (t) => getQualityLevel(t.confluences) === 1
    );
    const leakTrades = closedTrades.filter((t) =>
      isLeakSetup(t.confluences)
    );
    const wr = (ts: typeof closedTrades) =>
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

  const executionStats = React.useMemo(() => {
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
        `Best session: ${bestKz.name} (${bestKz.totalR >= 0 ? "+" : ""}${formatNumber(bestKz.totalR)}R, ${formatNumber(bestKz.winRate, 0)}% WR)`
      );
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

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/90">{periodLabel}</span>
          {!hasNoClosedTrades && (
            <span className="ml-2">
              · {hudMetrics.totalTrades} closed trades
            </span>
          )}
        </p>
      </div>

      {hasNoClosedTrades && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm font-medium">
          Not enough data for this period. Close trades or change the time
          range to see analytics.
        </div>
      )}

      {!hasNoClosedTrades && (
        <>
          {/* Core metrics */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Expectancy",
                value: `${formatNumber(hudMetrics.expectancy)}R`,
                sub: "Per trade",
                icon: Target,
                positive: hudMetrics.expectancy >= 0,
              },
              {
                label: "Win rate",
                value: `${formatNumber(hudMetrics.winRate, 0)}%`,
                sub: `${hudMetrics.totalTrades} trades`,
                icon: Activity,
                positive: true,
              },
              {
                label: "Profit factor",
                value: formatNumber(hudMetrics.profitFactor),
                sub: "Wins / losses",
                icon: TrendingUp,
                positive: hudMetrics.profitFactor >= 1,
              },
              {
                label: "Total R",
                value: `${hudMetrics.totalR >= 0 ? "+" : ""}${formatNumber(hudMetrics.totalR)}R`,
                sub: "Period",
                icon: Zap,
                positive: hudMetrics.totalR >= 0,
              },
              {
                label: "Drawdown",
                value: `${formatNumber(hudMetrics.drawdown)}R`,
                sub: "Max peak–trough",
                icon: TrendingDown,
                positive: hudMetrics.drawdown === 0,
              },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border/30 bg-card/40 p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-label uppercase tracking-wider">
                    {m.label}
                  </span>
                  <m.icon
                    size={16}
                    className={cn(
                      "text-muted-foreground/60",
                      m.positive !== undefined &&
                        (m.positive
                          ? "text-emerald-500/70"
                          : "text-rose-500/70")
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-2xl font-semibold tracking-tight tabular-nums",
                      m.positive !== undefined
                        ? m.positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                        : "text-foreground"
                    )}
                  >
                    {m.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </section>

          {insightLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground bg-muted/30 rounded-2xl px-5 py-3 border border-border/20"
            >
              {insightLine}
            </motion.p>
          )}

          {/* Equity curve */}
          <section>
            <h2 className="text-section mb-4">
              Equity curve
            </h2>
            <div className="rounded-2xl border border-border/30 bg-card/40 p-6 min-h-[380px] flex flex-col">
              <GlobalErrorBoundary>
                <EquityChart trades={filteredTrades} />
              </GlobalErrorBoundary>
            </div>
          </section>

          {/* Session performance */}
          <section>
            <h2 className="text-section mb-4 flex items-center gap-2">
              <Clock size={14} />
              Session performance
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {killzoneStats.map((row) => (
                <div
                  key={row.name}
                  className="rounded-2xl border border-border/30 bg-card/40 p-5 flex flex-col gap-1"
                >
                  <span className="text-label">
                    {row.name}
                  </span>
                  <span
                    className={cn(
                      "text-xl font-semibold tabular-nums",
                      row.totalR >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {row.totalR >= 0 ? "+" : ""}
                    {formatNumber(row.totalR)}R
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.count} trades · {formatNumber(row.winRate, 0)}% WR
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Plan adherence + Psychology */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/30 bg-card/40 p-6">
              <h2 className="text-section mb-4 flex items-center gap-2">
                <ShieldCheck size={14} />
                Plan adherence
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/20 p-4">
                  <span className="text-label">
                    Followed plan
                  </span>
                  <p
                    className={cn(
                      "text-lg font-semibold mt-1 tabular-nums",
                      planAdherenceStats.followed.totalR >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {planAdherenceStats.followed.totalR >= 0 ? "+" : ""}
                    {formatNumber(planAdherenceStats.followed.totalR)}R
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {planAdherenceStats.followed.count} trades ·{" "}
                    {formatNumber(planAdherenceStats.followed.winRate, 0)}% WR
                  </p>
                </div>
                <div className="rounded-xl bg-muted/20 p-4">
                  <span className="text-label">
                    Didn&apos;t follow
                  </span>
                  <p
                    className={cn(
                      "text-lg font-semibold mt-1 tabular-nums",
                      planAdherenceStats.notFollowed.totalR >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {planAdherenceStats.notFollowed.totalR >= 0 ? "+" : ""}
                    {formatNumber(planAdherenceStats.notFollowed.totalR)}R
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {planAdherenceStats.notFollowed.count} trades ·{" "}
                    {formatNumber(planAdherenceStats.notFollowed.winRate, 0)}%
                    WR
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/30 bg-card/40 p-6">
              <h2 className="text-section mb-4 flex items-center gap-2">
                <Brain size={14} />
                Psychology
              </h2>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {psychoTagStats.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border/10 last:border-0 text-sm"
                  >
                    <span
                      className={cn(
                        "font-medium",
                        row.totalR < 0 && "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {row.name}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span
                        className={cn(
                          "font-medium tabular-nums",
                          row.totalR >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {row.totalR >= 0 ? "+" : ""}
                        {formatNumber(row.totalR)}R
                      </span>
                      <span className="text-muted-foreground">
                        {row.count} · {formatNumber(row.winRate, 0)}% WR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {psychoTagStats.some((r) => r.totalR < 0) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Avoid revenge / FOMO — they correlate with negative R.
                </p>
              )}
            </div>
          </section>

          {/* Playbook + Leak + Execution */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/30 bg-card/40 p-5">
              <span className="text-label uppercase tracking-wider">
                A+ setup WR
              </span>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {formatNumber(playbookStats.highQualityWR, 0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {playbookStats.highCount} trades (7+ confluences)
              </p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-card/40 p-5">
              <span className="text-label uppercase tracking-wider">
                Low quality WR
              </span>
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                {formatNumber(playbookStats.lowQualityWR, 0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {playbookStats.lowCount} trades (&lt;6 confluences)
              </p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-card/40 p-5 flex flex-col justify-between">
              <span className="text-label uppercase tracking-wider">
                Leak (&lt;5 confluences)
              </span>
              <p
                className={cn(
                  "text-2xl font-semibold mt-1 tabular-nums",
                  playbookStats.leakR < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {playbookStats.leakR > 0 ? "+" : ""}
                {formatNumber(playbookStats.leakR)}R
              </p>
              {executionStats.winCount >= 1 && (
                <div className="mt-3 pt-3 border-t border-border/20 text-xs text-muted-foreground">
                  Target hit {formatNumber(executionStats.targetHitRate, 0)}% ·
                  Avg capture {formatNumber(executionStats.avgCapture, 0)}%
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
