"use client";

import * as React from "react";
import { ChevronDown, Clock } from "lucide-react";
import { useTrades } from "@/context/trade-context";
import { Trade } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { calculateRealizedRR } from "@/lib/trade-utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { modalContentClass } from "@/components/ui/modal-shell";
import { cn } from "@/lib/utils";
import { DetailHeader } from "./detail-header";
import { ReturnCallout } from "./return-callout";
import { MetricTiles } from "./metric-tiles";
import { IdentitySection } from "./identity-section";
import { ReflectionSection } from "./reflection-section";
import { VisualProof } from "./visual-proof";
import { CloseTradeWizard } from "./close-trade-wizard";

interface TradeDetailModalProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CollapsibleSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-muted/5">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-label truncate max-w-[60%]">{summary}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

export function TradeDetailModal({ trade, open, onOpenChange }: TradeDetailModalProps) {
  const { deleteTrade, updateTrade, addTrade } = useTrades();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [reflectionOpen, setReflectionOpen] = React.useState(false);
  const [visualsOpen, setVisualsOpen] = React.useState(false);

  const handleUpdate = React.useCallback(
    (partial: Partial<Trade>) => {
      updateTrade(trade.id, partial);
    },
    [trade.id, updateTrade]
  );

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this trade? This cannot be undone.")) {
      deleteTrade(trade.id);
      toast.error("Trade Deleted");
      onOpenChange(false);
    }
  };

  const handleDuplicate = () => {
    const duplicated: Trade = {
      ...trade,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: "Open",
      exitPrice: undefined,
      rrRealized: undefined,
      pnlAmount: undefined,
    };
    addTrade(duplicated);
    toast.success("Trade duplicated", { description: "New open trade added from this one." });
  };

  const handleCloseTrade = (
    status: "Win" | "Loss" | "Breakeven",
    exitPrice: string,
    followedPlan: boolean,
    feeling: string
  ) => {
    const price = parseFloat(exitPrice);
    if (isNaN(price)) return;

    const realizedRR = calculateRealizedRR({
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLoss,
      exitPrice: price,
      direction: trade.direction,
    });

    updateTrade(trade.id, {
      status,
      exitPrice: price,
      rrRealized: realizedRR,
      followedPlan,
      feeling,
    });

    toast.success("Trade Closed!");
    setIsClosing(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setIsEditing(false);
          setIsClosing(false);
          setReflectionOpen(false);
          setVisualsOpen(false);
        }
      }}
    >
      <DialogContent
        className={modalContentClass.detail}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="sr-only">
          <DialogTitle>Trade details — {trade.pair}</DialogTitle>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col w-full min-h-0 bg-card">
          <DetailHeader
            trade={trade}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onDone={() => setIsEditing(false)}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onClose={() => onOpenChange(false)}
          />

          <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
            <div className="p-4 md:p-6 space-y-6">
              <ReturnCallout trade={trade} />
              <IdentitySection
                trade={trade}
                isEditing={isEditing}
                onUpdate={handleUpdate}
              />
              <MetricTiles
                trade={trade}
                isEditing={isEditing}
                onUpdate={handleUpdate}
              />

              {(() => {
                const n = trade.confluences?.length ?? 0;
                const parts: string[] = [];
                if (n) parts.push(`${n} confluences`);
                if (trade.lessonLearned) parts.push("Lesson");
                if (trade.notes) parts.push("Notes");
                const reflectionSummary = parts.length ? parts.join(" · ") : "None";
                return (
                  <CollapsibleSection
                    title="Reflection"
                    summary={reflectionSummary}
                    open={reflectionOpen}
                    onToggle={() => setReflectionOpen((x) => !x)}
                  >
                    <ReflectionSection
                      trade={trade}
                      isEditing={isEditing}
                      onUpdate={handleUpdate}
                    />
                  </CollapsibleSection>
                );
              })()}

              {(() => {
                const before = !!trade.beforeScreenshotUrl;
                const after = !!trade.afterScreenshotUrl;
                const n = (before ? 1 : 0) + (after ? 1 : 0);
                const visualsSummary = n ? `${n} image${n > 1 ? "s" : ""}` : "No images";
                return (
                  <CollapsibleSection
                    title="Visuals"
                    summary={visualsSummary}
                    open={visualsOpen}
                    onToggle={() => setVisualsOpen((x) => !x)}
                  >
                    <div className="space-y-6">
                      <VisualProof
                        trade={trade}
                        isEditing={isEditing}
                        onUpdate={handleUpdate}
                      />
                      {trade.status === "Open" && !isClosing && (
                        <Button
                          onClick={() => setIsClosing(true)}
                          className="w-full h-12 bg-primary-accent text-white rounded-xl shadow-md hover:bg-primary-accent/90 transition-colors text-sm font-medium"
                        >
                          <Clock className="mr-2 w-4 h-4" />
                          Close position
                        </Button>
                      )}
                      {isClosing && (
                        <CloseTradeWizard
                          onCloseTrade={handleCloseTrade}
                          onCancel={() => setIsClosing(false)}
                        />
                      )}
                    </div>
                  </CollapsibleSection>
                );
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
