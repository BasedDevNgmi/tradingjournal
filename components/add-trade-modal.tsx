"use client";

import * as React from "react";
import { useTradesData } from "@/context/trade-context";
import { Trade } from "@/types";
import { toast } from "sonner";
import { TradeForm } from "@/components/trade-form/index";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ModalShell, modalContentClass } from "@/components/ui/modal-shell";

interface AddTradeModalProps {
  defaultType?: "live" | "missed";
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTradeModal({
  defaultType = "live",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AddTradeModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const { addTrade } = useTradesData();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const handleAddTrade = (data: any, calculatedRR: number) => {
    const newTrade: Trade = {
      id: crypto.randomUUID(),
      pair: data.pair.trim().toUpperCase(),
      direction: data.direction,
      status: data.isMissed ? "Missed" : "Open",
      date: new Date().toISOString(),
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      rrPredicted: calculatedRR,
      confluences: data.confluences,
      notes: data.notes,
      lessonLearned: data.lessonLearned,
      beforeScreenshotUrl: data.beforeScreenshotUrl,
      afterScreenshotUrl: data.afterScreenshotUrl,
      psychoTags: data.psychoTags,
      tags: [],
      currency: data.currency,
      pnlAmount: data.pnlAmount,
      riskPercent: data.riskPercent,
      session: data.session,
    };

    addTrade(newTrade);
    toast.success(data.isMissed ? "Missed Setup Logged" : "Trade Logged!", {
      description: data.isMissed
        ? "Keep refining your execution."
        : `Predicted: ${newTrade.rrPredicted.toFixed(2)}R`,
    });
    setOpen(false);
  };

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
          onClose={() => setOpen(false)}
          bodyClassName="p-0"
        >
          <TradeForm
            onSubmit={handleAddTrade}
            initialData={
              defaultType === "missed" ? ({ status: "Missed" } as any) : undefined
            }
          />
        </ModalShell>
      </DialogContent>
    </Dialog>
  );
}
