"use client";

import * as React from "react";
import { useTradesData } from "@/context/trade-context";
import { Trade } from "@/types";
import { toast } from "sonner";
import { TradeForm } from "@/components/trade-form/index";
import type { TradeFormValues } from "@/components/trade-form/schema";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ModalShell, modalContentClass } from "@/components/ui/modal-shell";
import { calculateRealizedRR } from "@/lib/trade-utils";

interface AddTradeModalProps {
  defaultType?: "live" | "missed";
  defaultMode?: "live" | "missed" | "past";
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTradeModal({
  defaultType = "live",
  defaultMode,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AddTradeModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const { addTrade } = useTradesData();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const resolveMode = defaultMode ?? (defaultType === "missed" ? "missed" : "live");

  const handleAddTrade = (data: TradeFormValues, calculatedRR: number) => {
    const isPast = data.status === "Win" || data.status === "Loss" || data.status === "Breakeven";
    const status = data.isMissed ? "Missed" : (data.status ?? "Open");
    const date = data.tradeDate?.trim()
      ? new Date(data.tradeDate + "T12:00:00Z").toISOString()
      : new Date().toISOString();
    const rrRealized =
      data.rrRealized ??
      (isPast && data.exitPrice != null
        ? calculateRealizedRR({
            entryPrice: data.entryPrice,
            stopLoss: data.stopLoss,
            exitPrice: data.exitPrice,
            direction: data.direction,
          })
        : undefined);

    const newTrade: Trade = {
      id: crypto.randomUUID(),
      pair: data.pair.trim().toUpperCase(),
      direction: data.direction,
      status,
      date,
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      exitPrice: data.exitPrice,
      rrPredicted: calculatedRR,
      rrRealized,
      confluences: data.confluences ?? [],
      notes: data.notes,
      lessonLearned: data.lessonLearned,
      beforeScreenshotUrl: data.beforeScreenshotUrl,
      afterScreenshotUrl: data.afterScreenshotUrl,
      psychoTags: data.psychoTags ?? [],
      tags: [],
      currency: data.currency,
      pnlAmount: data.pnlAmount,
      riskPercent: data.riskPercent,
      session: data.session,
      isNewsDay: data.isNewsDay ?? false,
      newsEvent: data.isNewsDay ? (data.newsEvent?.trim() || undefined) : undefined,
    };

    addTrade(newTrade);
    if (data.isMissed) {
      toast.success("Missed Setup Logged", { description: "Keep refining your execution." });
    } else if (isPast) {
      toast.success("Past Trade Logged", {
        description: rrRealized != null ? `Realized: ${rrRealized >= 0 ? "+" : ""}${rrRealized.toFixed(2)}R` : undefined,
      });
    } else {
      toast.success("Trade Logged!", { description: `Predicted: ${newTrade.rrPredicted.toFixed(2)}R` });
    }
    setOpen(false);
  };

  const initialData =
    resolveMode === "missed"
      ? ({ status: "Missed" } as Partial<Trade>)
      : resolveMode === "past"
        ? ({ status: "Win", date: new Date().toISOString() } as Partial<Trade>)
        : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={modalContentClass.add}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="sr-only">
          <DialogTitle>Add new trade</DialogTitle>
        </div>
        <ModalShell
          title="Add new trade"
          subtitle="Live entry, missed setup, or log a past trade"
          onClose={() => setOpen(false)}
          bodyClassName="p-0"
        >
          <TradeForm
            onSubmit={handleAddTrade}
            initialData={initialData as Partial<Trade> | undefined}
          />
        </ModalShell>
      </DialogContent>
    </Dialog>
  );
}
