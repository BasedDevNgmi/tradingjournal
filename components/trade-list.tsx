"use client";

import { useState, useMemo, useEffect } from "react";
import { useTrades } from "@/context/trade-context";
import { TradeCard } from "./trade-card";
import { TradeTable } from "./trade-table";
import { FilterBar, FilterType, ViewMode } from "./filter-bar";
import { Ghost } from "lucide-react";

export function TradeList() {
  const { trades } = useTrades();
  const [filter, setFilter] = useState<FilterType>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAndSortedTrades = useMemo(() => {
    let result = [...trades];

    // Filtering
    if (filter !== 'All') {
      result = result.filter(trade => trade.status === filter);
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
  }, [trades, filter, sortBy]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 border-4 border-black bg-zinc-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FilterBar 
        activeFilter={filter} 
        onFilterChange={setFilter}
        activeSort={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedTrades.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        ) : (
          <TradeTable trades={filteredAndSortedTrades} />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-black bg-zinc-50">
          <Ghost size={48} className="mb-4" />
          <h3 className="text-xl font-black uppercase tracking-tighter">No trades found</h3>
          <p className="text-sm font-bold uppercase text-zinc-500 mt-2">
            No trades found within these filters. Go take a setup!
          </p>
          <button 
            onClick={() => setFilter('All')}
            className="mt-6 text-xs font-black uppercase underline decoration-2 underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
