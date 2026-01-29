"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { useUsdNewsEvents } from "@/hooks/use-usd-news-events";

export interface NewsEventInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function NewsEventInput({
  value,
  onChange,
  placeholder = "e.g. CPI, FOMC, NFP",
  className,
  id,
  "aria-label": ariaLabel,
}: NewsEventInputProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const { events, loading, loadOnce, refresh } = useUsdNewsEvents();

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredTitles = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((title) => title.toLowerCase().includes(q));
  }, [events, query]);

  const showList = open && (loading || filteredTitles.length > 0);

  React.useEffect(() => {
    setHighlightedIndex((i) =>
      filteredTitles.length ? Math.min(i, filteredTitles.length - 1) : 0
    );
  }, [filteredTitles.length]);

  const handleFocus = () => {
    setOpen(true);
    loadOnce();
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

  const selectEvent = (title: string) => {
    setQuery(title);
    onChange(title);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && showList && filteredTitles.length > 0) {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i < filteredTitles.length - 1 ? i + 1 : i
      );
      return;
    }
    if (e.key === "ArrowUp" && showList && filteredTitles.length > 0) {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : 0));
      return;
    }
    if (
      e.key === "Enter" &&
      showList &&
      filteredTitles[highlightedIndex]
    ) {
      e.preventDefault();
      selectEvent(filteredTitles[highlightedIndex]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  React.useEffect(() => {
    if (!showList || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-index="${highlightedIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, showList]);

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
          aria-label={ariaLabel ?? "News event (e.g. CPI, FOMC)"}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? "news-event-list" : undefined}
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
          id="news-event-list"
          role="listbox"
          className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden max-h-[min(360px,70vh)]"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            ref={listRef}
            className="max-h-[min(320px,60vh)] overflow-y-auto overflow-x-hidden overscroll-contain py-1 scrollbar-thin"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span>Loading USD high-impact events…</span>
              </div>
            ) : filteredTitles.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                Type to enter manually (e.g. CPI, FOMC)
              </div>
            ) : (
              <>
                <ul className="list-none py-1" role="group">
                  {filteredTitles.map((title, index) => (
                    <li
                      key={title}
                      role="option"
                      data-index={index}
                      aria-selected={index === highlightedIndex}
                    >
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
                          selectEvent(title);
                        }}
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
                {events.length > 0 && (
                  <div className="border-t border-border/40 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => refresh()}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={loading ? "animate-spin" : undefined} />
                      Refresh list
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
