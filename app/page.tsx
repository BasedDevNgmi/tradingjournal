"use client";

import { useState } from "react";
import { TradeList } from "@/components/trade-list";
import { StatsOverview } from "@/components/stats-overview";
import { EquityChart } from "@/components/equity-chart";
import { CalendarView } from "@/components/calendar-view";
import { DataManagement } from "@/components/data-management";
import { TabSwitcher, TabType } from "@/components/tab-switcher";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('journal');

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="border-b-4 border-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">
            Trading Journal
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-2">
            Suen System / Superflat Edition
          </p>
        </div>
        <Link href="/add-trade" className="fixed bottom-6 right-4 z-50 sm:static">
          <Button className="w-16 h-16 sm:w-auto sm:h-12 rounded-full sm:rounded-none flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 bg-yellow-300 text-black border-4 border-black px-0 sm:px-8">
            <Plus size={32} strokeWidth={4} className="sm:mr-2 sm:w-6 sm:h-6" />
            <span className="font-black hidden sm:inline text-lg">Add Trade</span>
          </Button>
        </Link>
      </header>

      {/* Stats Section - Always visible above tabs for quick reference */}
      <StatsOverview />

      {/* Tab Switcher */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conditional Content Based on Active Tab */}
      <div className="pt-4">
        {activeTab === 'journal' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TradeList />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight italic border-l-8 border-black pl-4">Performance Curve</h2>
              <EquityChart />
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight italic border-l-8 border-black pl-4">Consistency Calendar</h2>
              <CalendarView />
            </section>
          </div>
        )}
        
        {/* Data Management Section at the bottom */}
        <div className="pt-12 mt-12 border-t-4 border-black">
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
