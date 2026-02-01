"use client";

import * as React from "react";
import { cn, formatNumber } from "../../lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";
import { calculateRealizedRR } from "@/lib/trade-utils";

interface Step3ExecutionProps {
  form: UseFormReturn<TradeFormValues>;
  calculatedRR: number;
}

function isPastTrade(status: TradeFormValues["status"]): boolean {
  return status === "Win" || status === "Loss" || status === "Breakeven";
}

export function Step3Execution({ form, calculatedRR }: Step3ExecutionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const formData = watch();
  const pastMode = isPastTrade(formData.status);

  const realizedRR = React.useMemo(() => {
    if (!pastMode || !formData.entryPrice || !formData.stopLoss || formData.exitPrice == null) return null;
    return calculateRealizedRR({
      entryPrice: formData.entryPrice,
      stopLoss: formData.stopLoss,
      exitPrice: formData.exitPrice,
      direction: formData.direction,
    });
  }, [pastMode, formData.entryPrice, formData.stopLoss, formData.exitPrice, formData.direction]);

  React.useEffect(() => {
    if (pastMode && realizedRR != null && !Number.isNaN(realizedRR)) {
      setValue("rrRealized", realizedRR);
    }
  }, [pastMode, realizedRR, setValue]);

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
          <span className="text-xs font-medium text-muted-foreground">
            {pastMode ? "Realized" : "Target"}
          </span>
          <span className={cn(
            "text-lg font-semibold tracking-tight",
            (pastMode ? realizedRR ?? 0 : calculatedRR) >= 2.5 ? "text-success" : (pastMode ? realizedRR ?? 0 : calculatedRR) >= 1.5 ? "text-warning" : "text-danger"
          )}>
            {pastMode
              ? (realizedRR != null ? formatNumber(realizedRR, 2) : "—") + "R"
              : (calculatedRR > 0 ? formatNumber(calculatedRR, 2) : "0.00") + "R"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Direction</label>
            <div className="flex bg-muted p-1 rounded-lg">
              {["Long", "Short"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("direction", d as any)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-md transition-colors",
                    formData.direction === d
                      ? d === "Long" ? "bg-success text-white shadow-md" : "bg-danger text-white shadow-md"
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
            {errors.riskPercent?.message && (
              <p className="text-xs font-medium text-danger ml-1" role="alert">{errors.riskPercent.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { id: "entryPrice" as const, label: "Entry Price", color: "focus-within:border-primary" },
            { id: "stopLoss" as const, label: "Stop Loss", color: "focus-within:border-danger" },
            { id: "takeProfit" as const, label: "Take Profit", color: "focus-within:border-success" },
          ].map((f) => (
            <div key={f.id} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">{f.label}</label>
              <div className={cn("bg-card border border-border p-3 rounded-lg transition-colors", f.color)}>
                <input
                  type="number"
                  step="any"
                  {...register(f.id, { valueAsNumber: true })}
                  className="w-full bg-transparent text-base font-semibold outline-none"
                />
              </div>
              {errors[f.id]?.message && (
                <p className="text-xs font-medium text-danger ml-1" role="alert">{errors[f.id]?.message}</p>
              )}
            </div>
          ))}
          {pastMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Exit Price</label>
              <div className="bg-card border border-border p-3 rounded-lg transition-colors focus-within:border-primary-accent">
                <input
                  type="number"
                  step="any"
                  {...register("exitPrice", { valueAsNumber: true })}
                  className="w-full bg-transparent text-base font-semibold outline-none"
                />
              </div>
              {errors.exitPrice?.message && (
                <p className="text-xs font-medium text-danger ml-1" role="alert">{errors.exitPrice.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
