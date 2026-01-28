"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isToday,
  isSameDay
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTrades } from "@/context/trade-context";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";

interface CalendarViewProps {
  /** When provided (e.g. from Analytics), use this list instead of context trades for time-filtered view. */
  trades?: Trade[];
}

export function CalendarView({ trades: tradesProp }: CalendarViewProps = {}) {
  const context = useTrades();
  const trades = tradesProp ?? context.trades;
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tradeDataByDay = React.useMemo(() => {
    const data: Record<string, { totalR: number, count: number, trades: any[] }> = {};
    
    trades.forEach((trade) => {
      const dateKey = format(new Date(trade.date), "yyyy-MM-dd");
      if (!data[dateKey]) {
        data[dateKey] = { totalR: 0, count: 0, trades: [] };
      }
      
      if (trade.status === 'Win' || trade.status === 'Loss' || trade.status === 'Breakeven') {
        data[dateKey].totalR += (trade.rrRealized || 0);
        data[dateKey].count += 1;
        data[dateKey].trades.push(trade);
      }
    });
    
    return data;
  }, [trades]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2 shrink-0">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <p className="text-xs font-medium text-muted-foreground/40">
            Monthly Consistency
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/30 hover:bg-muted transition-all active:scale-90 text-muted-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/30 hover:bg-muted transition-all active:scale-90 text-muted-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground/30 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 gap-1.5 flex-1">
          {days.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayData = tradeDataByDay[dateKey];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            const dailyR = dayData?.totalR || 0;
            const hasTrades = dayData?.count > 0;

            return (
              <div 
                key={dateKey}
                className={cn(
                  "relative rounded-2xl transition-all flex flex-col p-2 min-h-[70px]",
                  isCurrentMonth 
                    ? "bg-muted/10 border border-border/20 hover:border-border/50" 
                    : "bg-transparent opacity-[0.05] pointer-events-none",
                  today && "border-primary/30 bg-primary/[0.02]"
                )}
              >
                {/* Date Label */}
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-xs font-semibold",
                    today ? "text-primary" : "text-muted-foreground/40"
                  )}>
                    {format(day, "d")}
                  </span>
                  {today && (
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                
                {/* Trade Content */}
                <div className="flex-1 flex flex-col justify-center items-center gap-1">
                  {isCurrentMonth && hasTrades && (
                    <>
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-xs font-semibold tracking-tight",
                        dailyR > 0 ? "bg-emerald-500/10 text-emerald-500" : dailyR < 0 ? "bg-rose-500/10 text-rose-500" : "bg-muted text-muted-foreground"
                      )}>
                        {dailyR > 0 ? '+' : ''}{dailyR.toFixed(1)}R
                      </div>
                      <div className="flex gap-0.5">
                        {dayData.trades.slice(0, 3).map((t, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1 h-1 rounded-full",
                              t.status === 'Win' ? "bg-emerald-500" : t.status === 'Loss' ? "bg-rose-500" : "bg-muted-foreground/40"
                            )} 
                          />
                        ))}
                        {dayData.count > 3 && (
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
