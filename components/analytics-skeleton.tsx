"use client";

import { cn } from "@/lib/utils";

export function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="h-5 w-32 bg-muted/50 rounded-lg" />
      </div>
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border border-border/30 bg-card/40 p-5 flex flex-col gap-4"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-muted/50 rounded" />
              <div className="h-4 w-4 bg-muted/50 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted/50 rounded" />
              <div className="h-3 w-24 bg-muted/40 rounded" />
            </div>
          </div>
        ))}
      </section>
      <div className="rounded-2xl border border-border/30 bg-card/40 h-[320px] flex items-center justify-center">
        <div className="h-6 w-48 bg-muted/30 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/30 bg-card/40 p-5 h-48" />
        <div className="rounded-2xl border border-border/30 bg-card/40 p-5 h-48" />
      </div>
    </div>
  );
}
