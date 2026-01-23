"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

export type FilterType = 'All' | 'Win' | 'Loss' | 'Open' | 'Breakeven';
export type ViewMode = 'grid' | 'table';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Horizontal Scrollable Filters */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
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

          {/* View Toggle - Desktop only in this row, or separate on mobile */}
          <div className="hidden sm:flex border-2 border-black bg-white p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-1 transition-colors",
                viewMode === 'grid' ? "bg-black text-white" : "text-black hover:bg-zinc-100"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                "p-1 transition-colors",
                viewMode === 'table' ? "bg-black text-white" : "text-black hover:bg-zinc-100"
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* View Toggle - Mobile only */}
          <div className="flex sm:hidden border-2 border-black bg-white p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-1 transition-colors",
                viewMode === 'grid' ? "bg-black text-white" : "text-black hover:bg-zinc-100"
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                "p-1 transition-colors",
                viewMode === 'table' ? "bg-black text-white" : "text-black hover:bg-zinc-100"
              )}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-500">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="highest-r">Highest R</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
