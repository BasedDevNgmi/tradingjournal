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
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useTrades } from "@/context/trade-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function CalendarView() {
  const { trades } = useTrades();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tradesByDay = useMemo(() => {
    const data: Record<string, typeof trades> = {};
    
    trades.forEach((trade) => {
      const dateKey = format(new Date(trade.date), "yyyy-MM-dd");
      if (!data[dateKey]) data[dateKey] = [];
      data[dateKey].push(trade);
    });
    
    return data;
  }, [trades]);

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

  const selectedTrades = selectedDate ? tradesByDay[selectedDate] || [] : [];

  return (
    <div className="relative">
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
              const dayTrades = tradesByDay[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);

              return (
                <div 
                  key={dateKey}
                  onClick={() => isCurrentMonth && dayTrades.length > 0 && setSelectedDate(dateKey)}
                  className={cn(
                    "min-h-[80px] md:min-h-[100px] p-2 border-b-2 border-r-2 border-black last:border-r-0 flex flex-col justify-between transition-all",
                    !isCurrentMonth && "bg-zinc-50 opacity-30",
                    isCurrentMonth && dayTrades.length > 0 && "cursor-pointer hover:bg-zinc-50",
                    dailyR > 0 && isCurrentMonth && "bg-green-100 hover:bg-green-200",
                    dailyR < 0 && isCurrentMonth && "bg-red-100 hover:bg-red-200",
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

      {/* Deep Dive Drawer/Overlay */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-lg bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b-4 border-black bg-yellow-300 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Trades for</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                  {format(new Date(selectedDate), "dd MMMM yyyy")}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-2 bg-black text-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <X size={24} strokeWidth={4} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {selectedTrades.length > 0 ? (
                selectedTrades.map((trade) => (
                  <div 
                    key={trade.id}
                    onClick={() => {
                      setSelectedDate(null);
                      router.push(`/trade/${trade.id}`);
                    }}
                    className="brutalist-card flex justify-between items-center cursor-pointer hover:bg-zinc-50 transition-all active:translate-x-1 active:translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center border-4 border-black shrink-0",
                        trade.status === 'Win' ? 'bg-green-400' : trade.status === 'Loss' ? 'bg-red-400' : 'bg-blue-400'
                      )}>
                        {trade.status === 'Win' ? <TrendingUp size={20} strokeWidth={3} /> : <TrendingDown size={20} strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="font-black text-lg leading-none uppercase">{trade.pair}</p>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mt-1 flex items-center gap-1">
                          <Clock size={10} strokeWidth={3} /> {format(new Date(trade.date), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xl font-black tracking-tighter italic",
                        (trade.rrRealized || 0) > 0 ? "text-green-600" : (trade.rrRealized || 0) < 0 ? "text-red-600" : "text-black"
                      )}>
                        {trade.status === 'Open' 
                          ? `${trade.rrPredicted.toFixed(2)}R` 
                          : `${(trade.rrRealized || 0) > 0 ? '+' : ''}${(trade.rrRealized || 0).toFixed(2)}R`
                        }
                      </p>
                      <p className="text-[10px] font-black uppercase text-zinc-400">{trade.setupType}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-4 border-dashed border-zinc-200">
                  <p className="font-black uppercase text-zinc-400 italic">No trades recorded</p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t-4 border-black bg-zinc-50">
              <button 
                onClick={() => setSelectedDate(null)}
                className="w-full py-3 bg-black text-white font-black uppercase tracking-widest text-xs border-4 border-black active:translate-y-1 transition-all"
              >
                Close Deep Dive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
