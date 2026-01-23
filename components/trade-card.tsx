import { Trade } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TradeCard({ trade }: { trade: Trade }) {
  const isWin = trade.status === "Win";
  const isLoss = trade.status === "Loss";
  const isOpen = trade.status === "Open";
  const isBE = trade.status === "Breakeven";

  const dateFormatted = new Date(trade.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  return (
    <div className="bg-white border-4 border-black p-4 flex flex-col gap-4 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black uppercase tracking-tighter">
          {trade.pair}
        </h3>
        <span className="text-[10px] font-bold text-zinc-400 uppercase">
          {dateFormatted}
        </span>
      </div>

      {/* Visual Badges */}
      <div className="flex gap-2">
        <Badge variant={trade.direction === "Long" ? "success" : "destructive"}>
          {trade.direction}
        </Badge>
        <Badge
          variant={
            isWin ? "success" : isLoss ? "destructive" : isBE ? "outline" : "info"
          }
        >
          {trade.status}
        </Badge>
      </div>

      {/* Outcome / Focus */}
      <div className="flex-1 flex flex-col justify-center py-2">
        {(isWin || isLoss || isBE) ? (
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-zinc-500">Realized RR</span>
            <span className={cn(
              "text-4xl font-black tracking-tighter",
              isWin ? "text-green-600" : isLoss ? "text-red-600" : "text-black"
            )}>
              {trade.rrRealized !== undefined 
                ? `${trade.rrRealized > 0 ? '+' : ''}${trade.rrRealized}R`
                : '0.00R'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-zinc-500">Predicted RR</span>
            <span className="text-4xl font-black tracking-tighter text-blue-600">
              {trade.rrPredicted}R
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black pt-2 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase bg-yellow-300 px-1 border border-black">
          {trade.setupType}
        </span>
        <div className="flex gap-1">
          {trade.tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-zinc-400 uppercase">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
