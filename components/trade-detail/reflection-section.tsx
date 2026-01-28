"use client";

import * as React from "react";
import { Trade } from "@/types";
import { cn } from "@/lib/utils";
import { getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { Shield, Brain } from "lucide-react";
import { AOC_CONFLUENCES, PSYCHO_TAGS } from "@/lib/constants";

interface ReflectionSectionProps {
  trade: Trade;
  isEditing?: boolean;
  onUpdate?: (partial: Partial<Trade>) => void;
}

function toggleArray(arr: string[] | undefined, item: string): string[] {
  const list = arr ?? [];
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function ReflectionSection({
  trade,
  isEditing = false,
  onUpdate,
}: ReflectionSectionProps) {
  const confluenceCount = trade.confluences?.length || 0;
  const qualityLevel = getQualityLevel(trade.confluences);
  const { colorClass: qualityColor, label: levelLabel } = getQualityLevelStyle(qualityLevel);
  const levelBorder =
    qualityLevel === 3 ? "bg-emerald-500/10 border-emerald-500/30" : qualityLevel === 2 ? "bg-orange-500/10 border-orange-500/30" : "bg-rose-500/10 border-rose-500/30";

  if (isEditing && onUpdate) {
    return (
      <div className="space-y-10">
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <Shield size={12} />
              <h3 className="text-xs font-semibold">Playbook</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", qualityColor, levelBorder)}>
                {levelLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground/70">
                {confluenceCount} confluences
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AOC_CONFLUENCES.map((conf) => {
              const selected = trade.confluences?.includes(conf);
              return (
                <button
                  key={conf}
                  type="button"
                  onClick={() => onUpdate({ confluences: toggleArray(trade.confluences, conf) })}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors",
                    selected
                      ? "bg-primary-accent border-primary-accent text-white"
                      : "bg-muted/30 border-border/50 text-muted-foreground/70 hover:border-muted-foreground/40"
                  )}
                >
                  {conf}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground/40">
            <Brain size={12} />
            <h3 className="text-xs font-semibold">Reflection</h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PSYCHO_TAGS.map((tag) => {
                const selected = trade.psychoTags?.includes(tag);
                const isPositive = tag === "Disciplined";
                const isNegative = ["FOMO", "Revenge Trade", "Chasing"].includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      onUpdate({ psychoTags: toggleArray(trade.psychoTags, tag) })
                    }
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                      selected
                        ? isPositive
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isNegative
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "bg-blue-500 border-blue-500 text-white"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-primary-accent block">Lesson</label>
              <textarea
                value={trade.lessonLearned ?? ""}
                onChange={(e) => onUpdate({ lessonLearned: e.target.value || undefined })}
                placeholder="The #1 lesson..."
                rows={2}
                className="w-full p-4 text-sm font-medium bg-primary-accent/5 border border-primary-accent/20 rounded-xl outline-none focus:border-primary-accent transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">Notes</label>
              <textarea
                value={trade.notes ?? ""}
                onChange={(e) => onUpdate({ notes: e.target.value || undefined })}
                placeholder="Context or quote..."
                rows={2}
                className="w-full p-4 text-sm font-medium bg-muted/20 border border-border/40 rounded-xl outline-none focus:border-primary-accent transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-muted-foreground/40">
            <Shield size={12} />
            <h3 className="text-xs font-semibold">Playbook</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-md border",
                qualityLevel === 3 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : qualityLevel === 2 ? "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30" : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
              )}
            >
              {levelLabel}
            </span>
            <span className="text-xs font-medium text-muted-foreground/70">
              {confluenceCount} confluences
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trade.confluences?.map((conf, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-muted/30 border border-border/50 text-xs font-medium text-muted-foreground/70"
            >
              {conf}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground/40">
          <Brain size={12} />
          <h3 className="text-xs font-semibold">Reflection</h3>
        </div>
        <div className="space-y-4">
          {trade.psychoTags && trade.psychoTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trade.psychoTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-muted border border-border/50 text-xs font-medium text-muted-foreground/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {trade.lessonLearned && (
            <div className="bg-primary-accent/5 p-4 rounded-xl border border-primary-accent/20 relative overflow-hidden">
              <span className="text-xs font-medium text-primary-accent block mb-1.5">Lesson</span>
              <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
                &quot;{trade.lessonLearned}&quot;
              </p>
            </div>
          )}
          {trade.notes && (
            <div className="bg-muted/20 p-4 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground/80 leading-relaxed italic">
              &quot;{trade.notes}&quot;
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
