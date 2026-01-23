"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTrades } from "@/context/trade-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-[10px] font-black uppercase text-zinc-400">
          {payload[0].payload.fullDate}
        </p>
        <p className="text-lg font-black tracking-tighter">
          {payload[0].value > 0 ? "+" : ""}
          {payload[0].value.toFixed(2)}R
        </p>
      </div>
    );
  }
  return null;
};

export function EquityChart() {
  const { trades } = useTrades();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Filter closed trades and sort by date (oldest first)
    const closedTrades = trades
      .filter((t) => t.status === "Win" || t.status === "Loss" || t.status === "Breakeven")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (closedTrades.length === 0) return [];

    let cumulativeR = 0;
    const data = [
      {
        date: "Start",
        fullDate: "Initial State",
        equity: 0,
      },
    ];

    closedTrades.forEach((trade) => {
      cumulativeR += trade.rrRealized || 0;
      data.push({
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
      });
    });

    return data;
  }, [trades]);

  if (!mounted) {
    return (
      <Card className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="h-64 flex items-center justify-center bg-zinc-50 animate-pulse">
          <p className="text-xs font-black uppercase text-zinc-400">Loading Chart...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
      <CardHeader className="p-4 border-b-4 border-black bg-zinc-50">
        <CardTitle className="text-sm font-black uppercase tracking-widest">
          Equity Curve (Cumulative R)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        {chartData.length > 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <ReferenceLine y={0} stroke="#000" strokeWidth={2} strokeDasharray="4 4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tickLine={{ stroke: '#000', strokeWidth: 2 }}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#000' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tickLine={{ stroke: '#000', strokeWidth: 2 }}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#000' }}
                  tickFormatter={(value) => `${value}R`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Line
                  type="stepAfter"
                  dataKey="equity"
                  stroke="#000"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#fff' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-zinc-50">
            <p className="text-sm font-black uppercase tracking-tighter">No curve available</p>
            <p className="text-[10px] font-bold uppercase text-zinc-400 mt-2">
              Close your first trade to see the curve.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
