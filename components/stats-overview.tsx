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

  const statCards = [
    {
      label: "Total R",
      value: `${totalR > 0 ? '+' : ''}${totalR.toFixed(1)}R`,
      valueClass: totalR > 0 ? "text-green-600" : totalR < 0 ? "text-red-600" : "text-black",
      streak: null
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(0)}%`,
      valueClass: "text-black",
      streak: currentStreak > 1 ? {
        count: currentStreak,
        status: closedTrades[0].status
      } : null
    },
    {
      label: "Open",
      value: openTrades,
      valueClass: "text-blue-600",
      streak: null
    },
    {
      label: "Journal",
      value: totalTrades,
      valueClass: "text-black",
      streak: null
    }
  ];

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 gap-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible mb-4">
      {statCards.map((card, i) => (
        <div key={i} className="w-[75%] shrink-0 snap-start md:w-full">
          <Card className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full">
            <CardContent className="p-4 flex flex-col justify-center min-h-[100px]">
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{card.label}</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className={cn("text-3xl font-black tracking-tighter", card.valueClass)}>
                  {card.value}
                </p>
                {card.streak && (
                  <span className={cn(
                    "text-[10px] font-black px-1 border border-black whitespace-nowrap",
                    card.streak.status === 'Win' ? "bg-green-400 text-black" : "bg-red-400 text-black"
                  )}>
                    {card.streak.count} STREAK
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
