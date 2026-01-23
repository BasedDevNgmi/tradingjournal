"use client";

import { useTrades } from "@/context/trade-context";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, use } from "react";

export default function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { trades, deleteTrade, updateTrade } = useTrades();
  const [isClosing, setIsClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState("");

  const trade = trades.find((t) => t.id === id);

  if (!trade) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase">Trade not found</h1>
        <Button onClick={() => router.push("/")}>Back to Journal</Button>
      </div>
    );
  }

  const dateFormatted = new Date(trade.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this trade? This cannot be undone.")) {
      deleteTrade(trade.id);
      router.push("/");
    }
  };

  const handleCloseTrade = (status: 'Win' | 'Loss' | 'Breakeven') => {
    const price = parseFloat(exitPrice);
    if (isNaN(price)) {
      alert("Please enter a valid exit price.");
      return;
    }

    let realizedRR = 0;
    if (trade.direction === "Long") {
      const risk = trade.entryPrice - trade.stopLoss;
      const reward = price - trade.entryPrice;
      realizedRR = risk > 0 ? reward / risk : 0;
    } else {
      const risk = trade.stopLoss - trade.entryPrice;
      const reward = trade.entryPrice - price;
      realizedRR = risk > 0 ? reward / risk : 0;
    }

    updateTrade(trade.id, {
      status,
      exitPrice: price,
      rrRealized: parseFloat(realizedRR.toFixed(2)),
    });
    setIsClosing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/")}
          className="p-2 border-2 border-black hover:bg-zinc-100 transition-all active:translate-y-1"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{trade.pair}</h1>
          <p className="text-[10px] font-black uppercase text-zinc-400 mt-1">{dateFormatted}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
          <section className="grid grid-cols-2 gap-4">
            <div className="brutalist-card bg-zinc-50">
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Direction</p>
              <Badge variant={trade.direction === "Long" ? "success" : "destructive"} className="text-lg">
                {trade.direction}
              </Badge>
            </div>
            <div className="brutalist-card bg-zinc-50">
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Status</p>
              <Badge variant={trade.status === 'Win' ? 'success' : trade.status === 'Loss' ? 'destructive' : 'info'} className="text-lg">
                {trade.status}
              </Badge>
            </div>
          </section>

          <section className="brutalist-card space-y-4">
            <h3 className="font-black uppercase tracking-widest text-sm border-b-2 border-black pb-2">Entry Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Entry</p>
                <p className="text-xl font-black italic">{trade.entryPrice}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Stop Loss</p>
                <p className="text-xl font-black italic text-red-500">{trade.stopLoss}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Take Profit</p>
                <p className="text-xl font-black italic text-green-600">{trade.takeProfit}</p>
              </div>
            </div>
          </section>

          {trade.status !== 'Open' && (
            <section className="brutalist-card bg-black text-white space-y-4">
              <h3 className="font-black uppercase tracking-widest text-sm border-b-2 border-white/20 pb-2">Execution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400">Exit Price</p>
                  <p className="text-2xl font-black italic">{trade.exitPrice}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400">Realized R</p>
                  <p className={cn(
                    "text-2xl font-black italic",
                    (trade.rrRealized || 0) > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {(trade.rrRealized || 0) > 0 ? '+' : ''}{trade.rrRealized}R
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="font-black uppercase tracking-tight text-xl">Strategy & Context</h3>
            <div className="brutalist-card space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400">Setup Type</p>
                <p className="font-black uppercase bg-yellow-300 inline-block px-2 border-2 border-black">{trade.setupType}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Confluences</p>
                <div className="flex flex-wrap gap-2">
                  {trade.confluences.map((c, i) => (
                    <span key={i} className="text-xs font-bold border-2 border-black px-2 py-1 bg-white">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {trade.notes && (
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400">Notes</p>
                  <p className="text-sm font-medium italic mt-1">{trade.notes}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {trade.status === 'Open' && !isClosing && (
            <Button 
              onClick={() => setIsClosing(true)}
              className="w-full h-16 bg-blue-500 hover:bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Clock className="mr-2" />
              Close Trade
            </Button>
          )}

          {isClosing && (
            <div className="brutalist-card bg-yellow-50 space-y-4 border-dashed animate-in fade-in slide-in-from-top-4">
              <h4 className="font-black uppercase text-sm">Close this trade</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Exit Price</label>
                <input 
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full p-2 border-2 border-black font-black outline-none focus:bg-white"
                  placeholder="Enter exit price..."
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleCloseTrade('Win')}
                  className="bg-green-400 border-2 border-black p-2 font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Win
                </button>
                <button 
                  onClick={() => handleCloseTrade('Loss')}
                  className="bg-red-400 border-2 border-black p-2 font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Loss
                </button>
              </div>
              <button 
                onClick={() => setIsClosing(false)}
                className="w-full text-[10px] font-black uppercase underline"
              >
                Cancel
              </button>
            </div>
          )}

          <Button 
            onClick={handleDelete}
            variant="destructive"
            className="w-full h-16 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Trash2 className="mr-2" />
            Delete Trade
          </Button>
        </div>
      </div>
    </div>
  );
}
