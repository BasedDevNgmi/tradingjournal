"use client";

import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTrades } from "@/context/trade-context";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";

type ChartDataPoint = {
  id: string;
  date: string;
  fullDate: string;
  equity: number;
  bestTrade: { pair: string; rrRealized?: number } | null;
};

const CustomTooltip = ({ active, payload }: any) => {
  const context = useTrades();
  const isGhostMode = context?.isGhostMode;
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border p-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {data.fullDate}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-xl font-semibold tracking-tight transition-colors",
                payload[0].value >= 0 ? "text-success" : "text-danger",
                isGhostMode && "blur-md select-none"
              )}>
                {payload[0].value > 0 ? "+" : ""}
                {payload[0].value.toFixed(2)}
                <span className="text-xs ml-0.5 opacity-40">R</span>
              </span>
            </div>
          </div>
          
          {data.bestTrade && (
            <div className="pt-3 border-t border-border/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Best trade
              </p>
              <div className="flex items-center justify-between gap-6">
                <span className="text-sm font-medium text-foreground">{data.bestTrade.pair}</span>
                <span className={cn(
                  "text-sm font-semibold text-success",
                  isGhostMode && "blur-md select-none"
                )}>
                  +{data.bestTrade.rrRealized.toFixed(2)}R
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface EquityChartProps {
  /** When provided (e.g. from Analytics), use this list instead of context trades for time-filtered charts. */
  trades?: Trade[];
}

export function EquityChart({ trades: tradesProp }: EquityChartProps = {}) {
  const context = useTrades();
  const trades = tradesProp ?? context.trades;
  const isGhostMode = context.isGhostMode;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = React.useMemo(() => {
    const closedTrades = trades
      .filter((t) => t.status === "Win" || t.status === "Loss" || t.status === "Breakeven")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (closedTrades.length === 0) return [];

    const tradesByDate: Record<string, typeof closedTrades> = {};
    closedTrades.forEach(trade => {
      const dateKey = new Date(trade.date).toDateString();
      if (!tradesByDate[dateKey]) tradesByDate[dateKey] = [];
      tradesByDate[dateKey].push(trade);
    });

    let cumulativeR = 0;
    const data: ChartDataPoint[] = [
      {
        id: "start",
        date: "Start",
        fullDate: "Initial State",
        equity: 0,
        bestTrade: null,
      },
    ];

    closedTrades.forEach((trade) => {
      cumulativeR += trade.rrRealized || 0;
      
      const dateKey = new Date(trade.date).toDateString();
      const dailyTrades = tradesByDate[dateKey];
      const bestTradeOfDay = dailyTrades.reduce((prev, current) => 
        ((current.rrRealized || 0) > (prev.rrRealized || 0)) ? current : prev
      );

      data.push({
        id: trade.id,
        date: new Date(trade.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        fullDate: new Date(trade.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        equity: parseFloat(cumulativeR.toFixed(2)),
        bestTrade: bestTradeOfDay && (bestTradeOfDay.rrRealized || 0) > 0 ? {
          pair: bestTradeOfDay.pair,
          rrRealized: bestTradeOfDay.rrRealized
        } : null,
      });
    });

    return data;
  }, [trades]);

  const yDomain = React.useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const values = chartData.map(d => d.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(Math.abs(max - min) * 0.2, 5);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/5 animate-pulse rounded-[2.5rem]">
        <p className="text-sm font-medium text-muted-foreground/60">Syncing performance…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px]">
      {chartData.length > 1 ? (
        <div className="w-full h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 4" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fontWeight: 900, fill: 'var(--color-muted-foreground)', opacity: 0.3 }}
              interval="preserveStartEnd"
              minTickGap={60}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              domain={yDomain}
              tick={{ fontSize: 8, fontWeight: 900, fill: 'var(--color-muted-foreground)', opacity: 0.3 }}
              tickFormatter={(value) => `${value}R`}
              dx={-10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }} 
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorEquity)"
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: 'var(--color-primary)', 
                strokeWidth: 2, 
                fill: 'var(--color-card)',
                className: "shadow-xl"
              }}
              animationDuration={1500}
              className={cn(isGhostMode && "blur-sm")}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      ) : (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/20">
          <p className="text-sm font-medium text-muted-foreground">No performance data yet</p>
          <p className="text-xs font-medium text-muted-foreground/60 mt-2">
            Close your first trade to see your curve.
          </p>
        </div>
      )}
    </div>
  );
}
