"use client";

import { cn, formatNumber } from "../../lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";

interface Step3ExecutionProps {
  form: UseFormReturn<TradeFormValues>;
  calculatedRR: number;
}

export function Step3Execution({ form, calculatedRR }: Step3ExecutionProps) {
  const { register, watch, setValue } = form;
  const formData = watch();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6 pr-12">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">3. Execution</h3>
          <p className="text-xs font-medium text-muted-foreground">Numbers don't lie</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-lg bg-muted flex items-center gap-3 border border-border",
        )}>
          <span className="text-xs font-medium text-muted-foreground">Target</span>
          <span className={cn(
            "text-lg font-semibold tracking-tight",
            calculatedRR >= 2.5 ? "text-emerald-400" : calculatedRR >= 1.5 ? "text-orange-400" : "text-rose-400"
          )}>
            {calculatedRR > 0 ? formatNumber(calculatedRR, 2) : "0.00"}R
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Direction</label>
            <div className="flex bg-muted p-1 rounded-lg">
              {['Long', 'Short'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("direction", d as any)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-md transition-colors",
                    formData.direction === d 
                      ? d === 'Long' ? "bg-emerald-500 text-white shadow-md" : "bg-rose-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Risk %</label>
            <div className="flex items-center gap-3 bg-muted p-3 rounded-xl border border-border focus-within:border-primary-accent transition-colors">
              <input 
                type="number" 
                step="0.1"
                {...register("riskPercent", { valueAsNumber: true })}
                className="flex-1 bg-transparent text-lg font-semibold outline-none"
              />
              <span className="text-base font-medium opacity-50">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'entryPrice', label: 'Entry Price', color: 'focus-within:border-primary' },
            { id: 'stopLoss', label: 'Stop Loss', color: 'focus-within:border-rose-500' },
            { id: 'takeProfit', label: 'Take Profit', color: 'focus-within:border-emerald-500' }
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">{f.label}</label>
              <div className={cn("bg-card border border-border p-3 rounded-lg transition-colors", f.color)}>
                <input
                  type="number"
                  step="any"
                  {...register(f.id as any, { valueAsNumber: true })}
                  className="w-full bg-transparent text-base font-semibold outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
