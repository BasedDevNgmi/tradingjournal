"use client";

import * as React from "react";
import { useTrades } from "@/context/trade-context";
import { useAnalytics } from "@/hooks/use-analytics";
import { EquityChart } from "./equity-chart";
import { CalendarView } from "./calendar-view";
import { cn, formatNumber } from "../lib/utils";
import {
  Brain,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { GlobalErrorBoundary } from "./ui/error-boundary";
import { NewsEventDetailModal } from "./analytics/news-event-detail-modal";
import { CollapsibleAnalyticsSection } from "./analytics/collapsible-analytics-section";
import { MetricPill } from "./analytics/metric-pill";

export function AnalyticsView() {
  const { trades, timeFilter } = useTrades();
  const analytics = useAnalytics(trades, timeFilter);
  const {
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
  } = analytics;

  const [selectedEventName, setSelectedEventName] = React.useState<string | null>(null);
  const [whenOpen, setWhenOpen] = React.useState(true);
  const [newsOpen, setNewsOpen] = React.useState(false);
  const [howOpen, setHowOpen] = React.useState(false);

  const eventTrades = React.useMemo(() => {
    if (!selectedEventName) return [];
    return closedTrades.filter(
      (t) =>
        t.isNewsDay === true &&
        ((t.newsEvent?.trim() || "") || "No event") === selectedEventName
    );
  }, [closedTrades, selectedEventName]);

  const insightBullets = React.useMemo(() => {
    if (!insightLine) return [];
    return insightLine.split(" · ").filter(Boolean);
  }, [insightLine]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Period + count */}
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
        <div className="p-5 rounded-card bg-warning/10 border border-warning/20 text-warning text-sm font-medium">
          Not enough data for this period. Close trades or change the time
          range to see analytics.
        </div>
      )}

      {!hasNoClosedTrades && (
        <>
          {/* Hero: one metric + pills */}
          <section className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-label text-muted-foreground uppercase tracking-wider">
                Total R
              </span>
              <span
                className={cn(
                  "text-4xl font-bold tracking-tight tabular-nums",
                  hudMetrics.totalR >= 0
                    ? "text-success"
                    : "text-danger"
                )}
              >
                {hudMetrics.totalR >= 0 ? "+" : ""}
                {formatNumber(hudMetrics.totalR)}R
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <MetricPill
                label="Win rate"
                value={`${formatNumber(hudMetrics.winRate, 0)}%`}
              />
              <MetricPill
                label="Profit factor"
                value={formatNumber(hudMetrics.profitFactor)}
                positive={hudMetrics.profitFactor >= 1}
              />
              <MetricPill
                label="Drawdown"
                value={`${formatNumber(hudMetrics.drawdown)}R`}
                positive={hudMetrics.drawdown === 0}
              />
            </div>
          </section>

          {/* Equity curve + calendar (same height on lg) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:min-h-[420px]">
            <div className="lg:col-span-2 h-full min-h-[360px] rounded-2xl bg-muted/5 border border-border/20 p-6 flex flex-col">
              <GlobalErrorBoundary>
                <EquityChart trades={filteredTrades} />
              </GlobalErrorBoundary>
            </div>
            <div className="h-full min-h-[360px] rounded-2xl bg-muted/5 border border-border/20 p-6 flex flex-col">
              <GlobalErrorBoundary>
                <CalendarView trades={filteredTrades} />
              </GlobalErrorBoundary>
            </div>
          </section>

          {/* Insights */}
          {insightBullets.length > 0 && (
            <section className="rounded-2xl bg-muted/20 border border-border/20 px-5 py-4">
              <ul className="space-y-2">
                {insightBullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Explore: collapsible sections */}
          <section className="space-y-3">
            <CollapsibleAnalyticsSection
              title="When you trade"
              summary="Session · Mon–Fri"
              open={whenOpen}
              onToggle={() => setWhenOpen(!whenOpen)}
            >
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Session performance
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {killzoneStats.map((row) => (
                      <div
                        key={row.name}
                        className="rounded-xl border border-border/20 bg-muted/5 p-4 flex flex-col gap-1"
                      >
                        <span className="text-label text-muted-foreground">
                          {row.name}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold tabular-nums",
                            row.totalR >= 0
                              ? "text-success"
                              : "text-danger"
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
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                    <CalendarDays size={12} />
                    Performance by day
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {dayOfWeekStats.map((row) => (
                      <div
                        key={row.name}
                        className="rounded-xl border border-border/20 bg-muted/5 p-4 flex flex-col gap-1"
                      >
                        <span className="text-label text-muted-foreground">
                          {row.name}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold tabular-nums",
                            row.totalR >= 0
                              ? "text-success"
                              : "text-danger"
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
                </div>
              </div>
            </CollapsibleAnalyticsSection>

            <CollapsibleAnalyticsSection
              title="News"
              summary={`News vs non-news · ${newsEventStats.length} events`}
              open={newsOpen}
              onToggle={() => setNewsOpen(!newsOpen)}
            >
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    News vs non-news days
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {newsDayStats.map((row) => (
                      <div
                        key={row.name}
                        className="rounded-xl border border-border/20 bg-muted/5 p-4 flex flex-col gap-1"
                      >
                        <span className="text-label text-muted-foreground">
                          {row.name}
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold tabular-nums",
                            row.totalR >= 0
                              ? "text-success"
                              : "text-danger"
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
                </div>
                {newsEventStats.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      By event (trade / avoid)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Which events to trade and which to avoid (min 2 trades per
                      event). Click an event to view notes and lessons.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {newsEventTradeVsAvoid.trade.length > 0 && (
                        <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                          <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
                            <TrendingUp size={14} />
                            Trade these
                          </h4>
                          <ul className="space-y-0">
                            {newsEventTradeVsAvoid.trade.map((row) => (
                              <li
                                key={row.name}
                                className="border-b border-border/20 last:border-0"
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedEventName(row.name)}
                                  className="w-full flex items-center justify-between gap-3 py-2.5 text-left rounded-lg hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                  <span
                                    className="font-medium truncate text-sm"
                                    title={row.name}
                                  >
                                    {row.name}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0 text-xs">
                                    <span className="font-semibold text-success tabular-nums">
                                      +{formatNumber(row.totalR)}R
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.count} · {formatNumber(row.winRate, 0)}% WR
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className="text-muted-foreground shrink-0"
                                    />
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {newsEventTradeVsAvoid.avoid.length > 0 && (
                        <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                          <h4 className="text-sm font-semibold text-danger mb-2 flex items-center gap-2">
                            <TrendingDown size={14} />
                            Avoid these
                          </h4>
                          <ul className="space-y-0">
                            {newsEventTradeVsAvoid.avoid.map((row) => (
                              <li
                                key={row.name}
                                className="border-b border-border/20 last:border-0"
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedEventName(row.name)}
                                  className="w-full flex items-center justify-between gap-3 py-2.5 text-left rounded-lg hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                  <span
                                    className="font-medium truncate text-sm"
                                    title={row.name}
                                  >
                                    {row.name}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0 text-xs">
                                    <span className="font-semibold text-danger tabular-nums">
                                      {formatNumber(row.totalR)}R
                                    </span>
                                    <span className="text-muted-foreground">
                                      {row.count} · {formatNumber(row.winRate, 0)}% WR
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className="text-muted-foreground shrink-0"
                                    />
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {newsEventTradeVsAvoid.needMore.length > 0 && (
                      <div className="mt-4 rounded-xl border border-border/20 bg-muted/10 p-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Need more data
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {newsEventTradeVsAvoid.needMore.map((row) => (
                            <button
                              key={row.name}
                              type="button"
                              onClick={() => setSelectedEventName(row.name)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                              title={`${row.count} trade(s) · ${formatNumber(row.totalR)}R`}
                            >
                              {row.name} ({row.count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleAnalyticsSection>

            <CollapsibleAnalyticsSection
              title="How you trade"
              summary="Plan · Psychology · Playbook"
              open={howOpen}
              onToggle={() => setHowOpen(!howOpen)}
            >
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                      <ShieldCheck size={12} />
                      Plan adherence
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/20 p-3">
                        <span className="text-label text-muted-foreground">
                          Followed plan
                        </span>
                        <p
                          className={cn(
                            "text-base font-semibold mt-1 tabular-nums",
                            planAdherenceStats.followed.totalR >= 0
                              ? "text-success"
                              : "text-danger"
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
                      <div className="rounded-lg bg-muted/20 p-3">
                        <span className="text-label text-muted-foreground">
                          Didn&apos;t follow
                        </span>
                        <p
                          className={cn(
                            "text-base font-semibold mt-1 tabular-nums",
                            planAdherenceStats.notFollowed.totalR >= 0
                              ? "text-success"
                              : "text-danger"
                          )}
                        >
                          {planAdherenceStats.notFollowed.totalR >= 0 ? "+" : ""}
                          {formatNumber(planAdherenceStats.notFollowed.totalR)}R
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {planAdherenceStats.notFollowed.count} trades ·{" "}
                          {formatNumber(planAdherenceStats.notFollowed.winRate, 0)}% WR
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Brain size={12} />
                      Psychology
                    </h3>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {psychoTagStats.map((row) => (
                        <div
                          key={row.name}
                          className="flex items-center justify-between gap-2 py-2 border-b border-border/10 last:border-0 text-sm"
                        >
                          <span
                            className={cn(
                              "font-medium",
                              row.totalR < 0 &&
                                "text-danger"
                            )}
                          >
                            {row.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 text-xs">
                            <span
                              className={cn(
                                "font-medium tabular-nums",
                                row.totalR >= 0
                                  ? "text-success"
                                  : "text-danger"
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
                      <p className="mt-2 text-xs text-muted-foreground">
                        Avoid revenge / FOMO — they correlate with negative R.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Playbook and execution
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                      <span className="text-label text-muted-foreground uppercase tracking-wider">
                        A+ setup WR
                      </span>
                      <p className="text-xl font-semibold text-success mt-1 tabular-nums">
                        {formatNumber(playbookStats.highQualityWR, 0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {playbookStats.highCount} trades (7+ confluences)
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
                      <span className="text-label text-muted-foreground uppercase tracking-wider">
                        Low quality WR
                      </span>
                      <p className="text-xl font-semibold text-danger mt-1 tabular-nums">
                        {formatNumber(playbookStats.lowQualityWR, 0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {playbookStats.lowCount} trades (&lt;6 confluences)
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/20 bg-muted/5 p-4 flex flex-col justify-between">
                      <span className="text-label text-muted-foreground uppercase tracking-wider">
                        Leak (&lt;5 confluences)
                      </span>
                      <p
                        className={cn(
                          "text-xl font-semibold mt-1 tabular-nums",
                          playbookStats.leakR < 0
                            ? "text-danger"
                            : "text-success"
                        )}
                      >
                        {playbookStats.leakR > 0 ? "+" : ""}
                        {formatNumber(playbookStats.leakR)}R
                      </p>
                      {executionStats.winCount >= 1 && (
                        <div className="mt-2 pt-2 border-t border-border/20 text-xs text-muted-foreground">
                          Target hit {formatNumber(executionStats.targetHitRate, 0)}% ·
                          Avg capture {formatNumber(executionStats.avgCapture, 0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleAnalyticsSection>
          </section>

          {selectedEventName && (
            <NewsEventDetailModal
              eventName={selectedEventName}
              trades={eventTrades}
              open={!!selectedEventName}
              onOpenChange={(open) => {
                if (!open) setSelectedEventName(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
