"use client";

import { useTrades } from "@/context/trade-context";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function StatsOverview() {
  const { trades } = useTrades();
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-zinc-50 border-4 border-black animate-pulse" />
        ))}
      </div>
    );
  }

  // Calculations
  const wins = trades.filter(t => t.status === 'Win').length;
  const losses = trades.filter(t => t.status === 'Loss').length;
  const totalClosed = wins + losses;
  
  const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;
  
  const totalR = trades.reduce((acc, t) => acc + (t.rrRealized || 0), 0);
  const openTrades = trades.filter(t => t.status === 'Open').length;
  const totalTrades = trades.length;

  // Streak calculation (based on sorted date)
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const closedTrades = sortedTrades.filter(t => t.status === 'Win' || t.status === 'Loss');
  
  let currentStreak = 0;
  if (closedTrades.length > 0) {
    const firstStatus = closedTrades[0].status;
    for (const t of closedTrades) {
      if (t.status === firstStatus) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Block 1: Total R */}
      <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total R</p>
          <p className={cn(
            "text-3xl font-black tracking-tighter",
            totalR > 0 ? "text-green-600" : totalR < 0 ? "text-red-600" : "text-black"
          )}>
            {totalR > 0 ? '+' : ''}{totalR.toFixed(1)}R
          </p>
        </CardContent>
      </Card>

      {/* Block 2: Win Rate */}
      <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Win Rate</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter">
              {winRate.toFixed(0)}%
            </p>
            {currentStreak > 1 && (
              <span className={cn(
                "text-[10px] font-black px-1 border border-black",
                closedTrades[0].status === 'Win' ? "bg-green-400" : "bg-red-400"
              )}>
                {currentStreak} STREAK
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Open Trades */}
      <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Open</p>
          <p className="text-3xl font-black tracking-tighter text-blue-600">
            {openTrades}
          </p>
        </CardContent>
      </Card>

      {/* Block 4: Total Trades */}
      <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Journal</p>
          <p className="text-3xl font-black tracking-tighter">
            {totalTrades}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
