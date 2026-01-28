"use client";

import * as React from "react";
import { useTrades } from "@/context/trade-context";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { UnifiedTradeTable } from "@/components/unified-trade-table/index";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupTradesByDate, filterTradesByTimeFilter } from "../lib/utils";
import { getQualityLevelString } from "@/lib/trade-utils";

export type FilterType = 'All' | 'Win' | 'Loss' | 'Open' | 'Breakeven' | 'Missed';

interface TradeListProps {
  filter: FilterType[];
  setFilter: (filter: FilterType[]) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSetup: string;
  setSelectedSetup: (setup: string) => void;
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  selectedDirection: string;
  setSelectedDirection: (direction: string) => void;
  resetFilters: () => void;
  mounted: boolean;
  isMissedView?: boolean;
}

export function TradeList({
  filter,
  setFilter,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  selectedSetup,
  setSelectedSetup,
  selectedPair,
  setSelectedPair,
  selectedDirection,
  setSelectedDirection,
  resetFilters,
  mounted,
  isMissedView = false
}: TradeListProps) {
  const { trades, timeFilter } = useTrades();

  const filteredAndSortedTrades = React.useMemo(() => {
    let result = filterTradesByTimeFilter(trades, timeFilter);

    // Separate Missed from Journal
    if (isMissedView) {
      result = result.filter(trade => trade.status === 'Missed');
    } else {
      result = result.filter(trade => trade.status !== 'Missed');
      // Status Filtering (Multi-select)
      if (filter.length > 0 && !filter.includes('All')) {
        result = result.filter(trade => filter.includes(trade.status as FilterType));
      }
    }

    // Date Range Filtering
    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      result = result.filter(trade => new Date(trade.date) >= from);
    }
    if (dateRange?.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      result = result.filter(trade => new Date(trade.date) <= to);
    }

    // Quality Level Filtering
    if (selectedSetup !== 'all') {
      result = result.filter(trade => getQualityLevelString(trade.confluences) === selectedSetup);
    }

    // Pair Filtering
    if (selectedPair !== 'all') {
      result = result.filter(trade => {
        const tradePair = (trade.pair || "").trim().toLowerCase();
        const filterPair = selectedPair.trim().toLowerCase();
        return tradePair === filterPair;
      });
    }

    // Direction Filtering
    if (selectedDirection !== 'all') {
      result = result.filter(trade => trade.direction.toLowerCase() === selectedDirection.toLowerCase());
    }

    // Text Search — pair, notes, lessonLearned, tags, psychoTags; "BTC" matches "BTC/USDT"
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trade => {
        if (trade.pair.toLowerCase().includes(query)) return true;
        if (trade.notes?.toLowerCase().includes(query)) return true;
        if (trade.lessonLearned?.toLowerCase().includes(query)) return true;
        if (trade.tags?.some(t => t.toLowerCase().includes(query))) return true;
        if (trade.psychoTags?.some(t => t.toLowerCase().includes(query))) return true;
        return false;
      });
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
  }, [trades, filter, sortBy, searchQuery, selectedSetup, timeFilter, isMissedView, dateRange, selectedPair, selectedDirection]);

  const groupedTrades = React.useMemo(() => {
    return groupTradesByDate(filteredAndSortedTrades);
  }, [filteredAndSortedTrades]);

  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-muted border-2 border-border rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 border-2 border-border bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {filteredAndSortedTrades.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col min-h-0"
        >
          <UnifiedTradeTable
            groupedTrades={groupedTrades}
            onSortChange={setSortBy}
            activeSort={sortBy}
            isMissedView={isMissedView}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-32 workbench-panel relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
          <Ghost size={48} className="mb-6 text-muted-foreground/20 animate-pulse" />
          <h3 className="terminal-text text-lg text-foreground">
            {isMissedView ? "The edge is sharp" : "Silence on the floor"}
          </h3>
          <p className="text-sm font-medium text-muted-foreground mt-2 text-center px-8 max-w-[320px] leading-relaxed">
            {isMissedView 
              ? "Zero missed setups detected. Your discipline is your greatest asset." 
              : "No trades found in this period. Wait for your setup, don't force the market."}
          </p>
          {!isMissedView && (
            <Button
              onClick={resetFilters}
              className="mt-8"
            >
              Reset all filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
