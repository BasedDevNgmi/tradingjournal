"use client";

import { cn } from "@/lib/utils";

export type FilterType = 'All' | 'Win' | 'Loss' | 'Open' | 'Breakeven';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
}

export function FilterBar({ 
  activeFilter, 
  onFilterChange, 
  activeSort, 
  onSortChange 
}: FilterBarProps) {
  const filters: FilterType[] = ['All', 'Win', 'Loss', 'Open', 'Breakeven'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Horizontal Scrollable Filters */}
        <div className="overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 whitespace-nowrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black transition-all active:translate-y-[2px]",
                  activeFilter === filter 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-zinc-100"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-zinc-500">Sort by:</span>
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-white border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-black cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="highest-r">Highest R</option>
          </select>
        </div>
      </div>
    </div>
  );
}
