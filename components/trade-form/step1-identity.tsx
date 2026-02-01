"use client";

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";
import { PairInput } from "@/components/ui/pair-input";
import { NewsEventInput } from "@/components/ui/news-event-input";

const PAST_OUTCOMES = ["Win", "Loss", "Breakeven"] as const;
type PastOutcome = (typeof PAST_OUTCOMES)[number];

function isPastTrade(status: TradeFormValues["status"]): boolean {
  return status === "Win" || status === "Loss" || status === "Breakeven";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Step1IdentityProps {
  form: UseFormReturn<TradeFormValues>;
}

export function Step1Identity({ form }: Step1IdentityProps) {
  const { watch, setValue } = form;
  const formData = watch();
  const pastMode = isPastTrade(formData.status);

  const setLive = () => {
    setValue("isMissed", false);
    setValue("status", "Open");
    setValue("tradeDate", undefined);
    setValue("exitPrice", undefined);
    setValue("rrRealized", undefined);
  };
  const setMissed = () => {
    setValue("isMissed", true);
    setValue("status", "Missed");
    setValue("tradeDate", undefined);
    setValue("exitPrice", undefined);
    setValue("rrRealized", undefined);
  };
  const setPast = (outcome?: PastOutcome) => {
    setValue("isMissed", false);
    setValue("status", outcome ?? "Win");
    if (!formData.tradeDate) setValue("tradeDate", todayISO());
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6 pr-12">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">1. Identity</h3>
          <p className="text-xs font-medium text-muted-foreground">Context is everything</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg shrink-0 flex-wrap gap-1">
          <button
            type="button"
            onClick={setLive}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              !formData.isMissed && !pastMode ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Live
          </button>
          <button
            type="button"
            onClick={setMissed}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              formData.isMissed ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Missed
          </button>
          <button
            type="button"
            onClick={() => setPast()}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              pastMode ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Past trade
          </button>
        </div>
      </div>

      {pastMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/20 border border-border/50">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Trade date</label>
            <input
              type="date"
              value={formData.tradeDate ?? todayISO()}
              onChange={(e) => setValue("tradeDate", e.target.value || undefined)}
              className="w-full px-4 py-2.5 text-sm font-medium bg-card border border-border rounded-lg outline-none focus:border-primary-accent transition-colors"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Outcome</label>
            <div className="flex gap-2">
              {PAST_OUTCOMES.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setPast(outcome)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors",
                    formData.status === outcome
                      ? outcome === "Win"
                        ? "bg-success border-success text-white"
                        : outcome === "Loss"
                          ? "bg-danger border-danger text-white"
                          : "bg-muted-foreground border-muted-foreground text-white"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              {["Asia", "London", "New York"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("session", s as any)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors",
                    formData.session === s ? "bg-primary-accent border-primary-accent text-white" : "bg-card border-border text-muted-foreground hover:border-muted-foreground/40"
                  )}
                >
                  {s === "New York" ? "NY" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">News day</label>
            <div className="flex gap-2">
              {(["Yes", "No"] as const).map((choice) => {
                const isYes = choice === "Yes";
                const selected = formData.isNewsDay === isYes;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      setValue("isNewsDay", isYes);
                      if (!isYes) setValue("newsEvent", undefined);
                    }}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors",
                      selected ? "bg-primary-accent border-primary-accent text-white" : "bg-card border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {formData.isNewsDay && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">News event (e.g. CPI, FOMC)</label>
                <NewsEventInput
                  value={formData.newsEvent ?? ""}
                  onChange={(v) => setValue("newsEvent", v || undefined)}
                  placeholder="e.g. CPI, FOMC, NFP"
                />
                <p className="text-xs text-muted-foreground/70 ml-1">Pick from USD high-impact or type manually</p>
              </div>
            )}
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
