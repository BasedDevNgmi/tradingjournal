"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getUniquePairsByFrequency } from "@/lib/pair-suggestions";
import { useTradesData } from "@/context/trade-context";
import { cn } from "@/lib/utils";
import type { FilterType } from "@/types";

interface FiltersPopoverProps {
  filter: FilterType[];
  setFilter: (f: FilterType[]) => void;
  selectedSetup: string;
  setSelectedSetup: (s: string) => void;
  selectedPair: string;
  setSelectedPair: (s: string) => void;
  selectedDirection: string;
  setSelectedDirection: (s: string) => void;
  resetFilters: () => void;
  activeTab: "journal" | "analytics" | "missed";
}

const STATUS_OPTIONS: (FilterType | "All")[] = ["All", "Win", "Loss", "Open", "Breakeven"];
const SETUP_OPTIONS = [
  { value: "all", label: "All setups" },
  { value: "1", label: "Tier 1 (≤5 confluences)" },
  { value: "2", label: "Tier 2 (6 confluences)" },
  { value: "3", label: "Tier 3 (7+ confluences)" },
];

export function FiltersPopover({
  filter,
  setFilter,
  selectedSetup,
  setSelectedSetup,
  selectedPair,
  setSelectedPair,
  selectedDirection,
  setSelectedDirection,
  resetFilters,
  activeTab,
}: FiltersPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const { trades } = useTradesData();
  const uniquePairs = React.useMemo(
    () => getUniquePairsByFrequency(trades).map((x) => x.pair),
    [trades]
  );

  const isJournalOrMissed = activeTab === "journal" || activeTab === "missed";
  const hasActiveFilters =
    isJournalOrMissed &&
    ((filter.length > 0 && !(filter.length === 1 && filter[0] === "All")) ||
      selectedSetup !== "all" ||
      selectedPair !== "all" ||
      selectedDirection !== "all");

  const toggleStatus = (status: FilterType | "All") => {
    if (status === "All") {
      setFilter(["All"]);
      return;
    }
    let next = filter.filter((f) => f !== "All");
    if (next.includes(status)) next = next.filter((f) => f !== status);
    else next.push(status);
    setFilter(next.length === 0 ? ["All"] : next);
  };

  if (!isJournalOrMissed) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            hasActiveFilters
              ? "bg-primary-accent text-white border border-primary-accent"
              : "bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          aria-label="Open filters"
        >
          <Filter size={14} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90" aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0 border border-border rounded-xl shadow-md bg-card"
        align="start"
        sideOffset={8}
      >
        <div className="p-4 space-y-4 max-h-[min(70vh,480px)] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Filters</span>
            <button
              onClick={() => {
                resetFilters();
                setOpen(false);
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reset all
            </button>
          </div>

          {activeTab === "journal" && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        (s === "All" && (filter.length === 0 || (filter.length === 1 && filter[0] === "All"))) ||
                          (s !== "All" && filter.includes(s))
                          ? "bg-primary-accent text-white"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Setup quality</p>
                <div className="flex flex-wrap gap-1.5">
                  {SETUP_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedSetup(value)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedSetup === value ? "bg-primary-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Market</p>
                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                  <button
                    onClick={() => setSelectedPair("all")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      selectedPair === "all" ? "bg-primary-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    All
                  </button>
                  {uniquePairs.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPair(p)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedPair === p ? "bg-primary-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Direction</p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "Long", "Short"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDirection(d)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedDirection === d ? "bg-primary-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {d === "all" ? "All" : d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground/70 pt-1 border-t border-border/40">
            Time range is set by the Range button in the header.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
