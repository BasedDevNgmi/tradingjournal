"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AOC_CONFLUENCES } from "@/lib/constants";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";

interface Step2PlaybookProps {
  form: UseFormReturn<TradeFormValues>;
  setupQuality: {
    level: number;
    risk: string;
    color: string;
    bgColor: string;
    label: string;
  };
  toggleArrayItem: (fieldName: "psychoTags" | "confluences", item: string) => void;
}

export function Step2Playbook({ form, setupQuality, toggleArrayItem }: Step2PlaybookProps) {
  const { watch } = form;
  const formData = watch();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6 pr-12">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">2. Playbook</h3>
          <p className="text-xs font-medium text-muted-foreground">Verify your edge</p>
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors",
          setupQuality.level === 3 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
          setupQuality.level === 2 ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
          "bg-rose-500/10 border-rose-500/20 text-rose-500"
        )}>
          {setupQuality.label} • {setupQuality.risk}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AOC_CONFLUENCES.map((conf) => {
          const isSelected = formData.confluences?.includes(conf);
          return (
            <button
              key={conf}
              type="button"
              onClick={() => toggleArrayItem("confluences", conf)}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all group",
                isSelected 
                  ? "bg-primary-accent border-primary-accent text-white" 
                  : "bg-card border-border text-muted-foreground hover:border-muted-foreground/40"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors",
                isSelected ? "bg-background border-background" : "border-muted group-hover:border-muted-foreground/30"
              )}>
                {isSelected && <Check size={12} className="text-primary" strokeWidth={4} />}
              </div>
              <span className="text-sm font-medium leading-tight">{conf}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
