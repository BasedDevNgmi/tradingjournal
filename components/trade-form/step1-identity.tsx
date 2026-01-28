"use client";

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";
import { PairInput } from "@/components/ui/pair-input";

interface Step1IdentityProps {
  form: UseFormReturn<TradeFormValues>;
}

export function Step1Identity({ form }: Step1IdentityProps) {
  const { watch, setValue } = form;
  const formData = watch();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6 pr-12">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">1. Identity</h3>
          <p className="text-xs font-medium text-muted-foreground">Context is everything</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg shrink-0">
          {['Live', 'Missed'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("isMissed", t === 'Missed')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                (t === 'Missed' ? formData.isMissed : !formData.isMissed) ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Asset</label>
            <PairInput
              value={formData.pair}
              onChange={(v) => setValue("pair", v)}
              placeholder="e.g. BTC/USDT, AAPL"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Session</label>
            <div className="flex gap-2">
              {['Asia', 'London', 'New York'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("session", s as any)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors",
                    formData.session === s ? "bg-primary-accent border-primary-accent text-white" : "bg-card border-border text-muted-foreground hover:border-muted-foreground/40"
                  )}
                >
                  {s === 'New York' ? 'NY' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center rounded-3xl border-2 border-border bg-muted/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl" />
          <Activity size={32} className="text-primary/20 mb-4" />
          <p className="text-xs font-medium text-muted-foreground text-center">Precision Entry</p>
        </div>
      </div>
    </div>
  );
}
