"use client";

import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps {
  onSortChange?: (sort: string) => void;
  activeSort?: string;
}

export function TableHeader({ onSortChange, activeSort }: TableHeaderProps) {
  const SortHeader = ({
    label,
    sortKey,
    className,
    align = "left",
  }: {
    label: string;
    sortKey: string;
    className?: string;
    align?: "left" | "right" | "center";
  }) => (
    <th
      className={cn(
        "px-4 py-3 text-xs font-medium text-muted-foreground bg-background sticky top-0 z-20",
        className
      )}
    >
      <button
        onClick={() => onSortChange?.(activeSort === sortKey ? "newest" : sortKey)}
        className={cn(
          "flex items-center gap-1.5 hover:text-foreground transition-colors w-full",
          align === "right" && "justify-end",
          align === "center" && "justify-center"
        )}
      >
        {label}
        <ArrowUpDown
          size={12}
          className={cn(activeSort === sortKey ? "text-primary-accent" : "text-muted-foreground/40")}
        />
      </button>
    </th>
  );

  return (
    <tr className="bg-background">
      <th className="w-[240px] pl-6 pr-4 py-3 text-xs font-medium text-muted-foreground text-left">
        Market
      </th>
      <th className="w-[120px] px-4 py-3 text-xs font-medium text-muted-foreground text-left">
        Side
      </th>
      <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-left">
        Setup
      </th>
      <th className="w-[180px] px-4 py-3 text-xs font-medium text-muted-foreground text-center">
        Status
      </th>
      <SortHeader label="Return" sortKey="highest-r" align="right" className="w-[200px] pl-4 pr-10" />
    </tr>
  );
}
