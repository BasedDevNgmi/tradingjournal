"use client";

import { Trade } from "@/types";
import { cn } from "../../lib/utils";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { PairInput } from "@/components/ui/pair-input";
import { NewsEventInput } from "@/components/ui/news-event-input";

interface IdentitySectionProps {
  trade: Trade;
  isEditing?: boolean;
  onUpdate?: (partial: Partial<Trade>) => void;
}

export function IdentitySection({
  trade,
  isEditing = false,
  onUpdate,
}: IdentitySectionProps) {
  const dateFormatted = format(new Date(trade.date), "dd MMM yyyy · HH:mm");

  if (isEditing && onUpdate) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[140px] w-40">
          <PairInput
            value={trade.pair}
            onChange={(v) => onUpdate({ pair: v })}
            placeholder="Pair or asset"
          />
        </div>
        <div className="flex bg-muted/30 p-1 rounded-lg border border-border/50 gap-0">
          {(["Long", "Short"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onUpdate({ direction: d })}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                trade.direction === d
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <Calendar size={12} />
          <span className="text-xs font-medium mono-data">{dateFormatted}</span>
        </div>
        <select
          value={trade.session ?? ""}
          onChange={(e) =>
            onUpdate({
              session: (e.target.value || undefined) as Trade["session"],
            })
          }
          className="flex items-center gap-1.5 text-xs font-medium bg-muted/20 border border-border/50 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-accent"
        >
          <option value="">No session</option>
          <option value="Asia">Asia</option>
          <option value="London">London</option>
          <option value="New York">New York</option>
        </select>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">News day</span>
          <div className="flex gap-2">
            {([true, false] as const).map((isNews) => (
              <button
                key={String(isNews)}
                type="button"
                onClick={() =>
                  onUpdate({
                    isNewsDay: isNews,
                    ...(isNews ? {} : { newsEvent: undefined }),
                  })
                }
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                  trade.isNewsDay === isNews
                    ? "bg-primary-accent border-primary-accent text-white"
                    : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {isNews ? "Yes" : "No"}
              </button>
            ))}
          </div>
          {trade.isNewsDay && (
            <div className="min-w-[160px]">
              <span className="text-xs font-medium text-muted-foreground block mb-1.5">News event</span>
              <NewsEventInput
                value={trade.newsEvent ?? ""}
                onChange={(v) => onUpdate({ newsEvent: v?.trim() || undefined })}
                placeholder="e.g. CPI, FOMC"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/70">
      <span className="flex items-center gap-1.5 shrink-0">
        <Calendar size={12} className="shrink-0" />
        <span className="mono-data">{dateFormatted}</span>
      </span>
      {trade.session && (
        <>
          <span className="text-muted-foreground/40 shrink-0">·</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock size={12} className="shrink-0" />
            <span>{trade.session}</span>
          </span>
        </>
      )}
      {trade.isNewsDay != null && (
        <>
          <span className="text-muted-foreground/40 shrink-0">·</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span>News day: {trade.isNewsDay ? "Yes" : "No"}</span>
          </span>
        </>
      )}
      {trade.isNewsDay && trade.newsEvent && (
        <>
          <span className="text-muted-foreground/40 shrink-0">·</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span>Event: {trade.newsEvent}</span>
          </span>
        </>
      )}
    </div>
  );
}
