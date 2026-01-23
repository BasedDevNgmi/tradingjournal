"use client";

import { cn } from "@/lib/utils";
import { BookOpen, BarChart2 } from "lucide-react";

export type TabType = 'journal' | 'analytics';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex w-full border-4 border-black mb-8 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button
        onClick={() => onTabChange('journal')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest transition-all",
          activeTab === 'journal' 
            ? "bg-black text-white" 
            : "bg-white text-black hover:bg-zinc-100"
        )}
      >
        <BookOpen size={20} strokeWidth={3} />
        Journal
      </button>
      <button
        onClick={() => onTabChange('analytics')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest transition-all border-l-4 border-black",
          activeTab === 'analytics' 
            ? "bg-black text-white" 
            : "bg-white text-black hover:bg-zinc-100"
        )}
      >
        <BarChart2 size={20} strokeWidth={3} />
        Analytics
      </button>
    </div>
  );
}
