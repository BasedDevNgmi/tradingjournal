"use client";

import * as React from "react";
import { useTrades } from "@/context/trade-context";
import { FilterType, TabType } from "@/types";
import { cn, formatNumber, filterTradesByTimeFilter } from "../lib/utils";

interface StatsOverviewProps {
  onStatClick?: (filter: FilterType) => void;
  activeFilter?: FilterType;
  activeTab?: TabType;
  /** Compact variant for single unified header bar: Performance R + Win Rate only, smaller spacing */
  variant?: 'default' | 'compact';
}

export function StatsOverview({ onStatClick, activeFilter, activeTab = 'journal', variant = 'default' }: StatsOverviewProps) {
  const { trades, timeFilter } = useTrades();
  const [mounted, setMounted] = React.useState(false);

  const filteredTrades = React.useMemo(() => {
    const isMissedTab = activeTab === 'missed';
    let result = trades.filter(t => isMissedTab ? t.status === 'Missed' : t.status !== 'Missed');
    return filterTradesByTimeFilter(result, timeFilter);
  }, [trades, activeTab, timeFilter]);

  const stats = React.useMemo(() => {
    const closedTrades = filteredTrades.filter(t => t.status !== 'Open' && t.status !== 'Missed');
    const totalR = closedTrades.reduce((acc, t) => acc + (t.rrRealized || 0), 0);
    const winRate = closedTrades.length > 0 
      ? (closedTrades.filter(t => t.status === 'Win').length / closedTrades.length) * 100 
      : 0;
    
    return {
      totalR,
      winRate,
      count: filteredTrades.length,
      wins: filteredTrades.filter(t => t.status === 'Win').length,
      losses: filteredTrades.filter(t => t.status === 'Loss').length,
    };
  }, [filteredTrades]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={cn("bg-muted/20 animate-pulse rounded-lg", variant === 'compact' ? "h-8 w-24" : "h-10 w-full")} />;

  const StatItem = ({ label, value, subValue, color, filterType }: { label: string, value: string, subValue: string, color: string, filterType?: FilterType }) => (
    <button 
      onClick={() => filterType && onStatClick?.(filterType)}
      className={cn(
        "flex flex-col items-start shrink-0 rounded-lg hover:bg-muted/50 active:scale-[0.98] transition-all duration-150 text-left",
        variant === 'compact' ? "p-1.5" : "p-2",
        filterType && activeFilter === filterType ? "bg-muted/30 ring-1 ring-border/40" : ""
      )}
    >
      <span className={cn("leading-none text-label", variant === 'compact' ? "mb-0.5" : "mb-1.5")}>{label}</span>
      <div className={cn("flex items-baseline leading-none", variant === 'compact' ? "gap-1" : "gap-1.5")}>
        <span className={cn("mono-data", color, variant === 'compact' ? "text-xs sm:text-sm" : "text-data md:text-base")}>{value}</span>
        <span className={cn("opacity-70 text-label")}>{subValue}</span>
      </div>
    </button>
  );

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0">
        <StatItem label="Performance" value={`${stats.totalR > 0 ? '+' : ''}${formatNumber(stats.totalR, 2)}`} subValue="R" color={stats.totalR >= 0 ? "text-success" : "text-danger"} />
        <div className="w-px h-5 bg-border/20 shrink-0 hidden sm:block" />
        <div className="hidden md:block">
          <StatItem label="Win Rate" value={`${formatNumber(stats.winRate, 0)}%`} subValue="WR" color="text-foreground/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
      <StatItem label="Performance" value={`${stats.totalR > 0 ? '+' : ''}${formatNumber(stats.totalR, 2)}`} subValue="R" color={stats.totalR >= 0 ? "text-success" : "text-danger"} />
      <div className="w-px h-6 bg-border/20 shrink-0" />
      <StatItem label="Win Rate" value={`${formatNumber(stats.winRate, 0)}%`} subValue="WR" color="text-foreground/80" />
      <div className="w-px h-6 bg-border/20 shrink-0 hidden sm:block" />
      <div className="flex items-center gap-10">
        <StatItem label="Wins" value={stats.wins.toString()} subValue="T" color="text-success/80" filterType="Win" />
        <StatItem label="Losses" value={stats.losses.toString()} subValue="T" color="text-danger/80" filterType="Loss" />
      </div>
    </div>
  );
}
