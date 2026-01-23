"use client";

import { Trade } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Image as ImageIcon } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto border-4 border-black">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-4 text-[10px] font-black uppercase tracking-widest">Date</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest">Pair</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">Dir</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">Setup</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest">Status</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">PnL (R)</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black">
          {trades.map((trade) => {
            const dateFormatted = new Date(trade.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            });
            const isWin = trade.status === "Win";
            const isLoss = trade.status === "Loss";
            const isBE = trade.status === "Breakeven";

            return (
              <tr 
                key={trade.id}
                onClick={() => router.push(`/trade/${trade.id}`)}
                className="bg-white hover:bg-zinc-50 cursor-pointer transition-colors group"
              >
                <td className="p-4 text-xs font-bold uppercase text-zinc-400">
                  {dateFormatted}
                </td>
                <td className="p-4 text-black">
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase tracking-tighter text-lg">{trade.pair}</span>
                    {(trade.beforeScreenshotUrl || trade.afterScreenshotUrl) && <ImageIcon size={14} className="text-zinc-400" />}
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <Badge variant={trade.direction === "Long" ? "success" : "destructive"}>
                    {trade.direction[0]}
                  </Badge>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-[10px] font-black uppercase bg-yellow-300 px-1 border border-black">
                    {trade.setupType}
                  </span>
                </td>
                <td className="p-4">
                  <Badge
                    variant={
                      isWin ? "success" : isLoss ? "destructive" : isBE ? "outline" : "info"
                    }
                  >
                    {trade.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <span className={cn(
                    "font-mono font-black text-xl tracking-tighter",
                    isWin ? "text-green-600" : isLoss ? "text-red-600" : "text-black"
                  )}>
                    {trade.status === 'Open' 
                      ? `${trade.rrPredicted.toFixed(2)}R` 
                      : `${(trade.rrRealized || 0) > 0 ? '+' : ''}${(trade.rrRealized || 0).toFixed(2)}R`
                    }
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
