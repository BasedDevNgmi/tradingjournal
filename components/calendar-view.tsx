"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTrades } from "@/context/trade-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const { trades } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tradeDataByDay = useMemo(() => {
    const data: Record<string, number> = {};
    
    trades.forEach((trade) => {
      if (trade.status === 'Win' || trade.status === 'Loss' || trade.status === 'Breakeven') {
        const dateKey = format(new Date(trade.date), "yyyy-MM-dd");
        data[dateKey] = (data[dateKey] || 0) + (trade.rrRealized || 0);
      }
    });
    
    return data;
  }, [trades]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
      <CardHeader className="p-4 border-b-4 border-black bg-zinc-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-black uppercase tracking-widest">
          Monthly Consistency ({format(currentMonth, "MMMM yyyy")})
        </CardTitle>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-1 border-2 border-black hover:bg-white transition-all active:translate-y-[2px]"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 border-2 border-black hover:bg-white transition-all active:translate-y-[2px]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b-2 border-black bg-zinc-100">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-[10px] font-black uppercase tracking-tighter border-r-2 last:border-r-0 border-black">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 overflow-hidden">
          {days.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dailyR = tradeDataByDay[dateKey];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div 
                key={dateKey}
                className={cn(
                  "min-h-[80px] md:min-h-[100px] p-2 border-b-2 border-r-2 border-black last:border-r-0 flex flex-col justify-between transition-colors",
                  !isCurrentMonth && "bg-zinc-50 opacity-30",
                  dailyR > 0 && isCurrentMonth && "bg-green-100",
                  dailyR < 0 && isCurrentMonth && "bg-red-100",
                  today && isCurrentMonth && "ring-4 ring-inset ring-yellow-300"
                )}
              >
                <span className={cn(
                  "text-[10px] font-black",
                  today ? "bg-black text-white px-1" : "text-black"
                )}>
                  {format(day, "d")}
                </span>
                
                {isCurrentMonth && dailyR !== undefined && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className={cn(
                      "text-sm md:text-xl font-black tracking-tighter italic",
                      dailyR > 0 ? "text-green-600" : dailyR < 0 ? "text-red-600" : "text-black"
                    )}>
                      {dailyR > 0 ? '+' : ''}{dailyR.toFixed(1)}R
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
