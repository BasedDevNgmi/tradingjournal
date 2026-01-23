"use client";

import { useState, useMemo, useEffect } from "react";
import { useTrades } from "@/context/trade-context";
import { TradeCard } from "./trade-card";
import { TradeTable } from "./trade-table";
import { FilterBar, FilterType } from "./filter-bar";
import { Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

export function TradeList() {
  const { trades } = useTrades();
  const [filter, setFilter] = useState<FilterType>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSetup, setSelectedSetup] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const uniqueSetups = useMemo(() => {
    const setups = new Set(trades.map(t => t.setupType));
    return Array.from(setups).sort();
  }, [trades]);

  const filteredAndSortedTrades = useMemo(() => {
    let result = [...trades];

    // Status Filtering
    if (filter !== 'All') {
      result = result.filter(trade => trade.status === filter);
    }

    // Setup Filtering
    if (selectedSetup !== 'all') {
      result = result.filter(trade => trade.setupType === selectedSetup);
    }

    // Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trade => 
        trade.pair.toLowerCase().includes(query) || 
        (trade.notes && trade.notes.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'highest-r') {
      result.sort((a, b) => {
        const rA = a.rrRealized ?? a.rrPredicted ?? 0;
        const rB = b.rrRealized ?? b.rrPredicted ?? 0;
        return rB - rA;
      });
    }

    return result;
  }, [trades, filter, sortBy, searchQuery, selectedSetup]);

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-zinc-50 border-4 border-black" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 border-4 border-black bg-zinc-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 md:pb-8">
      <FilterBar 
        activeFilter={filter} 
        onFilterChange={setFilter}
        activeSort={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSetup={selectedSetup}
        onSetupChange={setSelectedSetup}
        uniqueSetups={uniqueSetups}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedTrades.length > 0 ? (
        <>
          {/* Card View (Always visible on mobile, conditional on desktop) */}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            viewMode === 'table' ? "md:hidden" : "block"
          )}>
            {filteredAndSortedTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>

          {/* Table View (Hidden on mobile, conditional on desktop) */}
          <div className={cn(
            "hidden md:block",
            viewMode === 'grid' && "md:hidden"
          )}>
            <TradeTable trades={filteredAndSortedTrades} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-black bg-zinc-50">
          <Ghost size={48} className="mb-4 text-black" />
          <h3 className="text-xl font-black uppercase tracking-tighter text-black">No trades found</h3>
          <p className="text-sm font-bold uppercase text-zinc-500 mt-2 text-center px-4">
            No trades found within these filters. Go take a setup!
          </p>
          <button 
            onClick={() => setFilter('All')}
            className="mt-6 text-xs font-black uppercase underline decoration-2 underline-offset-4 text-black"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
