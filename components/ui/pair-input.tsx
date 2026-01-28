"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getPairSuggestionsGrouped } from "@/lib/pair-suggestions";
import { useTradesData } from "@/context/trade-context";
import { cn } from "@/lib/utils";

export interface PairInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const DEBOUNCE_MS = 150;
const MAX_PER_SECTION = 6;

export function PairInput({
  value,
  onChange,
  placeholder = "e.g. BTC/USDT, EUR/USD",
  className,
  id,
  "aria-label": ariaLabel,
}: PairInputProps) {
  const { trades } = useTradesData();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const [debouncedQuery, setDebouncedQuery] = React.useState(value);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Sync external value into query when it changes (e.g. form reset)
  React.useEffect(() => {
    setQuery(value);
    setDebouncedQuery(value);
  }, [value]);

  // Debounce query for suggestion lookup
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const suggestionsGrouped = React.useMemo(
    () => getPairSuggestionsGrouped(trades, debouncedQuery, { maxPerSection: MAX_PER_SECTION }),
    [trades, debouncedQuery]
  );

  const flatPairs = React.useMemo(
    () => suggestionsGrouped.flatMap((g) => g.pairs),
    [suggestionsGrouped]
  );

  const showList = open && flatPairs.length > 0;

  // Don't keep dropdown open when there are no suggestions
  React.useEffect(() => {
    if (open && flatPairs.length === 0) setOpen(false);
  }, [open, flatPairs.length]);

  // Clamp highlighted index when list changes
  React.useEffect(() => {
    setHighlightedIndex((i) => (flatPairs.length ? Math.min(i, flatPairs.length - 1) : 0));
  }, [flatPairs.length]);

  const handleFocus = () => {
    setOpen(true);
    setHighlightedIndex(0);
  };

  const handleBlur = () => {
    window.setTimeout(() => setOpen(false), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    setHighlightedIndex(0);
    setOpen(true);
  };

  const selectPair = (pair: string) => {
    setQuery(pair);
    onChange(pair);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < flatPairs.length - 1 ? i + 1 : i));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : 0));
      return;
    }
    if (e.key === "Enter" && flatPairs[highlightedIndex]) {
      e.preventDefault();
      selectPair(flatPairs[highlightedIndex]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (!showList || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, showList]);

  let flatIndex = 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel ?? "Trading pair or asset"}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? "pair-suggestions-list" : undefined}
          role="combobox"
          className={cn(
            "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none transition-colors",
            "placeholder:text-muted-foreground focus:border-primary-accent focus:ring-1 focus:ring-primary-accent/20",
            className
          )}
        />
      </PopoverTrigger>
      {showList && (
        <PopoverContent
          id="pair-suggestions-list"
          role="listbox"
          className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            ref={listRef}
            className="max-h-[280px] overflow-y-auto overflow-x-hidden overscroll-contain py-1 scrollbar-thin"
            style={{ WebkitOverflowScrolling: "touch" }}
            onWheel={(e) => {
              const el = listRef.current;
              if (!el) return;
              e.stopPropagation();
              const { deltaY } = e;
              const isScrollable = el.scrollHeight > el.clientHeight;
              const atTop = el.scrollTop <= 0 && deltaY < 0;
              const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && deltaY > 0;
              if (isScrollable && !(atTop && deltaY < 0) && !(atBottom && deltaY > 0)) {
                e.preventDefault();
                el.scrollTop += deltaY;
              }
            }}
          >
            {suggestionsGrouped.map((section) => (
              <div key={section.label} className="pb-1 last:pb-0">
                <div
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  aria-hidden
                >
                  {section.label}
                </div>
                <ul className="list-none" role="group" aria-label={section.label}>
                  {section.pairs.map((pair) => {
                    const index = flatIndex++;
                    return (
                      <li key={pair} role="option" data-index={index} aria-selected={index === highlightedIndex}>
                        <button
                          type="button"
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm font-medium transition-colors",
                            index === highlightedIndex
                              ? "bg-primary-accent/15 text-primary-accent"
                              : "text-foreground hover:bg-muted/50"
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectPair(pair);
                          }}
                        >
                          {pair}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
