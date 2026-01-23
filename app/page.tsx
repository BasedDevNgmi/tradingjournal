import { Plus, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-end gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Trading Dashboard</p>
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Your <br className="sm:hidden" /> Journal
          </h2>
        </div>
        <Button className="shrink-0">
          <Plus className="mr-2" size={20} strokeWidth={3} />
          <span className="hidden sm:inline">Add Trade</span>
        </Button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-green-400">
          <CardHeader className="p-4 border-b-2">
            <p className="text-xs font-black uppercase tracking-widest">Total Profit</p>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-4xl font-black tracking-tighter">+$1,240.50</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-300">
          <CardHeader className="p-4 border-b-2">
            <p className="text-xs font-black uppercase tracking-widest">Win Rate</p>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-4xl font-black tracking-tighter">64.5%</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-400">
          <CardHeader className="p-4 border-b-2">
            <p className="text-xs font-black uppercase tracking-widest">Open Trades</p>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-4xl font-black tracking-tighter">12</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades Table (Custom Brutalist style) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black uppercase tracking-tight">Recent Activity</h3>
          <button className="text-xs font-black uppercase underline decoration-4 underline-offset-4">View All</button>
        </div>
        
        <div className="space-y-4">
          {[
            { pair: "BTC/USDT", type: "Long", profit: "+$240.20", status: "win", time: "2h ago" },
            { pair: "ETH/USDT", type: "Short", profit: "-$80.45", status: "loss", time: "5h ago" },
            { pair: "SOL/USDT", type: "Long", profit: "+$420.00", status: "win", time: "Yesterday" },
          ].map((trade, i) => (
            <div 
              key={i} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border-4 border-black bg-white hover:bg-zinc-50 transition-all cursor-pointer active:translate-x-1 active:translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className={`w-12 h-12 flex items-center justify-center border-4 border-black ${trade.status === 'win' ? 'bg-green-400' : 'bg-red-400'}`}>
                  {trade.status === 'win' ? <TrendingUp size={24} strokeWidth={3} /> : <TrendingDown size={24} strokeWidth={3} />}
                </div>
                <div>
                  <p className="font-black text-xl leading-none uppercase tracking-tighter">{trade.pair}</p>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mt-1 flex items-center gap-1">
                    <Clock size={10} strokeWidth={3} /> {trade.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-end justify-between sm:flex-col sm:items-end gap-1">
                <span className={`text-2xl font-black tracking-tighter ${trade.status === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.profit}
                </span>
                <span className="text-xs font-black uppercase bg-black text-white px-2 py-0.5">
                  {trade.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="pt-12 pb-8 border-t-4 border-black flex flex-col sm:flex-row justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          © 2026 Trading Journal / Superflat Edition
        </p>
        <div className="flex gap-4">
          <div className="w-4 h-4 bg-black"></div>
          <div className="w-4 h-4 bg-zinc-300"></div>
          <div className="w-4 h-4 bg-zinc-100"></div>
        </div>
      </footer>
    </div>
  );
}
