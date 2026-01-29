"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { FilterType, TabType } from "@/types";
import { useTradesUI } from "@/context/trade-context";

export function useJournalFilters(setActiveTab: (tab: TabType) => void) {
  const { setTimeFilter } = useTradesUI();
  const [filter, setFilter] = React.useState<FilterType[]>(['All']);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSetup, setSelectedSetup] = React.useState("all");
  const [selectedPair, setSelectedPair] = React.useState("all");
  const [selectedDirection, setSelectedDirection] = React.useState("all");
  const [selectedNewsDay, setSelectedNewsDay] = React.useState("all");
  const [selectedNewsEvent, setSelectedNewsEvent] = React.useState("all");

  const resetFilters = React.useCallback(() => {
    setFilter(['All']);
    setDateRange(undefined);
    setSortBy('newest');
    setSearchQuery("");
    setSelectedSetup("all");
    setSelectedPair("all");
    setSelectedDirection("all");
    setSelectedNewsDay("all");
    setSelectedNewsEvent("all");
    setTimeFilter('ALL');
  }, [setTimeFilter]);

  const handleStatClick = React.useCallback((newFilter: FilterType) => {
    resetFilters();
    setFilter([newFilter]);
    setActiveTab('journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetFilters, setActiveTab]);

  return {
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
    selectedNewsDay,
    setSelectedNewsDay,
    selectedNewsEvent,
    setSelectedNewsEvent,
    resetFilters,
    handleStatClick
  };
}
