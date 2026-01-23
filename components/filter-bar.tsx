"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

export type FilterType = 'All' | 'Win' | 'Loss' | 'Open' | 'Breakeven';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function FilterBar({ 
  activeFilter, 
  onFilterChange, 
  activeSort, 
  onSortChange,
  viewMode,
  onViewModeChange
}: FilterBarProps) {
  const filters: FilterType[] = ['All', 'Win', 'Loss', 'Open', 'Breakeven'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* Horizontal Scrollable Container for Filters and Sort */}
        <div className="flex-1 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {/* Filters */}
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={cn(
                  "shrink-0 px-4 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black transition-all active:translate-y-[2px]",
                  activeFilter === filter 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-zinc-100"
                )}
              >
                {filter}
              </button>
            ))}

            {/* Divider for mobile */}
            <div className="shrink-0 w-[2px] h-6 bg-black/10 mx-2 sm:hidden" />

            {/* Sort Select Integrated into the row */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-zinc-500">Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-white border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="highest-r">Highest R</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* View Toggle - Hidden on very small screens or kept if space permits */}
        <div className="hidden md:flex items-center shrink-0 border-2 border-black h-[34px]">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "px-2 h-full flex items-center transition-colors",
              viewMode === 'grid' ? "bg-black text-white" : "bg-white text-black"
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={cn(
              "px-2 h-full flex items-center transition-colors border-l-2 border-black",
              viewMode === 'table' ? "bg-black text-white" : "bg-white text-black"
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
