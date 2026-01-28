"use client";

import { Search, Calendar as CalendarIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatsOverview } from "@/components/stats-overview";
import { FiltersPopover } from "@/components/filters-popover";
import { useTradesUI } from "@/context/trade-context";
import type { FilterType } from "@/types";

const searchBarContent = (
  searchInputRef: React.RefObject<HTMLInputElement | null>,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  isMobileSearchOpen: boolean,
  setIsMobileSearchOpen: (open: boolean) => void
) => (
  <>
    <Search size={14} className="absolute left-4 text-muted-foreground group-focus-within:text-primary-accent transition-colors shrink-0" />
    <input
      ref={searchInputRef}
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onBlur={() => {
        if (!searchQuery) setIsMobileSearchOpen(false);
      }}
      placeholder="Search trades, pairs, notes..."
      className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-10 py-2.5 text-sm font-medium outline-none focus:bg-card focus:border-primary-accent/40 focus:ring-1 focus:ring-primary-accent/20 transition-all placeholder:text-muted-foreground"
    />
    {isMobileSearchOpen && (
      <button
        type="button"
        onClick={() => {
          setSearchQuery("");
          setIsMobileSearchOpen(false);
        }}
        className="absolute right-3 p-1.5 rounded-lg hover:bg-muted transition-all"
      >
        <X size={14} className="text-muted-foreground" />
      </button>
    )}
  </>
);

interface JournalHeaderProps {
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  focusSearch: () => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  resetFilters: () => void;
  /** Single unified bar: filter state for FiltersPopover */
  filter: FilterType[];
  setFilter: (f: FilterType[]) => void;
  selectedSetup: string;
  setSelectedSetup: (s: string) => void;
  selectedPair: string;
  setSelectedPair: (s: string) => void;
  selectedDirection: string;
  setSelectedDirection: (s: string) => void;
  activeTab: "journal" | "analytics" | "missed";
  onStatClick?: (filter: FilterType) => void;
  activeFilter?: FilterType;
}

export function JournalHeader({
  isMobileSearchOpen,
  setIsMobileSearchOpen,
  setIsMobileMenuOpen,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  focusSearch,
  dateRange,
  setDateRange,
  resetFilters,
  filter,
  setFilter,
  selectedSetup,
  setSelectedSetup,
  selectedPair,
  setSelectedPair,
  selectedDirection,
  setSelectedDirection,
  activeTab,
  onStatClick,
  activeFilter,
}: JournalHeaderProps) {
  const { timeFilter, setTimeFilter } = useTradesUI();
  return (
    <div className="w-full flex items-center gap-4 md:gap-6 min-w-0">
      {/* Left: Mobile Toggle + Compact Stats */}
      {!isMobileSearchOpen && (
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted lg:hidden transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 bg-primary-accent rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-current" />
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-muted/10 pl-2 pr-3 py-1 sm:pl-3 sm:pr-4 sm:py-1.5 border-r border-border/20">
            <StatsOverview
              variant="compact"
              onStatClick={onStatClick}
              activeFilter={activeFilter}
              activeTab={activeTab}
            />
          </div>
        </div>
      )}

      {/* Center: Desktop search (always visible from sm, no animation) */}
      <div className="flex-1 min-w-0 max-w-2xl hidden sm:block group">
        <div className="relative flex items-center w-full group/search">
          {searchBarContent(searchInputRef, searchQuery, setSearchQuery, isMobileSearchOpen, setIsMobileSearchOpen)}
        </div>
      </div>

      {/* Center: Mobile search (animated when open) */}
      <div className="flex-1 min-w-0 sm:hidden overflow-hidden">
        <AnimatePresence mode="wait">
          {isMobileSearchOpen && (
            <motion.div
              key="mobile-search"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full group"
            >
              <div className="relative flex items-center w-full group/search">
                {searchBarContent(searchInputRef, searchQuery, setSearchQuery, isMobileSearchOpen, setIsMobileSearchOpen)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Date range + Filters */}
      {!isMobileSearchOpen && (
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button 
            onClick={focusSearch}
            className="p-2.5 rounded-lg bg-muted/30 border border-border text-muted-foreground sm:hidden transition-colors hover:bg-muted/50"
          >
            <Search size={18} />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 px-4 md:px-5 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                (dateRange?.from || timeFilter !== 'ALL') && "bg-primary-accent text-white border-primary-accent shadow-sm"
              )}>
                <CalendarIcon size={14} />
                <span className="hidden md:inline">
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}` : format(dateRange.from, "MMM dd")
                  ) : timeFilter !== 'ALL' ? (
                    timeFilter === '1D' ? 'Today' : timeFilter === '1W' ? '1W' : '1M'
                  ) : "Range"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] min-w-[360px] p-0 border border-border rounded-xl shadow-md overflow-hidden bg-card" align="end" sideOffset={8}>
              <div className="flex flex-col">
                <div className="p-5 bg-muted/10">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Quick periods</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['1D', '1W', '1M', 'ALL'].map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          setTimeFilter(label as any);
                          setDateRange(undefined);
                        }}
                        className={cn(
                          "py-2.5 text-xs font-medium rounded-lg transition-colors",
                          timeFilter === label && !dateRange?.from
                            ? "bg-primary-accent text-white"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {label === '1D' ? 'Today' : label === '1W' ? '1W' : label === '1M' ? '1M' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 pt-6 border-t border-border min-w-[320px]">
                  <p className="text-xs font-medium text-muted-foreground mb-5">Custom range</p>
                  <div className="w-full flex justify-center pt-0.5">
                    <div className="w-[280px] min-w-[280px]">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          if (range?.from) {
                            setTimeFilter('ALL');
                          }
                        }}
                        numberOfMonths={1}
                        className="p-0 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setDateRange(undefined);
                      setTimeFilter('ALL');
                    }}
                    className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={resetFilters}
                    className="flex-1 py-2.5 text-sm font-medium text-muted-foreground border border-border hover:bg-muted rounded-lg transition-colors"
                  >
                    Reset all
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <FiltersPopover
            filter={filter}
            setFilter={setFilter}
            selectedSetup={selectedSetup}
            setSelectedSetup={setSelectedSetup}
            selectedPair={selectedPair}
            setSelectedPair={setSelectedPair}
            selectedDirection={selectedDirection}
            setSelectedDirection={setSelectedDirection}
            resetFilters={resetFilters}
            activeTab={activeTab}
          />
        </div>
      )}
    </div>
  );
}
