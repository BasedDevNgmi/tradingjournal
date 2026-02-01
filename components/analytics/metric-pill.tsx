"use client";

import { cn } from "@/lib/utils";

interface MetricPillProps {
  label: string;
  value: string;
  /** When set, applies success/danger color to value */
  positive?: boolean;
  className?: string;
}

export function MetricPill({ label, value, positive, className }: MetricPillProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted/20 border border-border/20 px-3 py-2 flex flex-col gap-0.5 min-w-0",
        className
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums truncate",
          positive === true && "text-success",
          positive === false && "text-danger"
        )}
      >
        {value}
      </span>
    </div>
  );
}
