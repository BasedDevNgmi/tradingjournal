import { TradeList } from "@/components/trade-list";
import { StatsOverview } from "@/components/stats-overview";
import { EquityChart } from "@/components/equity-chart";
import { CalendarView } from "@/components/calendar-view";
import { DataManagement } from "@/components/data-management";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="border-b-4 border-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Trading Journal
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
            Suen System / Superflat Edition
          </p>
        </div>
        <Link href="/add-trade">
          <Button className="w-full sm:w-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            <Plus className="mr-2" size={20} strokeWidth={3} />
            Add Trade
          </Button>
        </Link>
      </header>

      {/* Stats Section */}
      <StatsOverview />

      {/* Charts & Consistency Section */}
      <div className="grid grid-cols-1 gap-8">
        <EquityChart />
        <CalendarView />
      </div>

      {/* Main Content */}
      <div className="pt-4 space-y-12">
        <TradeList />
        
        {/* Data Management Section at the bottom */}
        <div className="pt-12 border-t-4 border-black">
          <DataManagement />
        </div>
      </div>
      
      <footer className="pt-12 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-black mt-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          © 2026 Trading Journal
        </p>
        <div className="flex gap-4">
          <div className="w-4 h-4 bg-black"></div>
          <div className="w-4 h-4 bg-green-400"></div>
          <div className="w-4 h-4 bg-red-400"></div>
          <div className="w-4 h-4 bg-yellow-300"></div>
        </div>
      </footer>
    </div>
  );
}
