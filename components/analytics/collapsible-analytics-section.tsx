"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleAnalyticsSectionProps {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleAnalyticsSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: CollapsibleAnalyticsSectionProps) {
  return (
    <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-label text-muted-foreground truncate max-w-[60%]">
          {summary}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-0 border-t border-border/20">{children}</div>}
    </div>
  );
}
