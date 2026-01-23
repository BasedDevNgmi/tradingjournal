import { MOCK_TRADES } from "@/lib/mock-data";
import { TradeCard } from "./trade-card";

export function TradeList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_TRADES.map((trade) => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
}
