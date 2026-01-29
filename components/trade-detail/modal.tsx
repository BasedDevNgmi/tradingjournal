"use client";

import * as React from "react";
import { ChevronDown, Clock, MessageSquare, ImageIcon } from "lucide-react";
import { useTrades } from "@/context/trade-context";
import { Trade } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { calculateRealizedRR } from "@/lib/trade-utils";
import { OPEN_ADD_TRADE_WITH_INITIAL_EVENT } from "@/components/keyboard-shortcuts";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { modalContentClass } from "@/components/ui/modal-shell";
import { cn } from "@/lib/utils";
import { DetailHeader } from "./detail-header";
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
  id,
  title,
  summary,
  open,
  onToggle,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  const contentId = `${id}-content`;
  return (
    <div className={cn("border border-border/50 rounded-xl overflow-hidden transition-colors", open ? "bg-muted/5" : "bg-muted/[0.03]")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={contentId}
        id={id}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-muted/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {Icon && <Icon size={14} className="shrink-0 text-muted-foreground/80" />}
          <span>{title}</span>
        </span>
        <span className="text-xs font-medium text-muted-foreground truncate max-w-[55%]">{summary}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <div id={contentId} role="region" aria-labelledby={id} className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

export function TradeDetailModal({ trade, open, onOpenChange }: TradeDetailModalProps) {
  const { deleteTrade, updateTrade, addTrade } = useTrades();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editSnapshot, setEditSnapshot] = React.useState<Partial<Trade> | null>(null);
  const [isClosing, setIsClosing] = React.useState(false);
  const [reflectionOpen, setReflectionOpen] = React.useState(true);
  const [visualsOpen, setVisualsOpen] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const cancelDeleteRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (showDeleteConfirm && cancelDeleteRef.current) {
      cancelDeleteRef.current.focus();
    }
  }, [showDeleteConfirm]);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => closeButtonRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleUpdate = React.useCallback(
    (partial: Partial<Trade>) => {
      updateTrade(trade.id, partial);
    },
    [trade.id, updateTrade]
  );

  const handleEditStart = React.useCallback(() => {
    setEditSnapshot({ ...trade });
    setIsEditing(true);
  }, [trade]);

  const handleCancelEdit = React.useCallback(() => {
    if (editSnapshot) {
      updateTrade(trade.id, editSnapshot);
      setEditSnapshot(null);
    }
    setIsEditing(false);
  }, [editSnapshot, trade.id, updateTrade]);

  const handleCopySummary = React.useCallback(() => {
    const n = trade.confluences?.length ?? 0;
    const rr = trade.status !== "Open" && trade.status !== "Missed" ? (trade.rrRealized ?? 0) : trade.rrPredicted ?? 0;
    const rrStr = rr > 0 ? `+${rr.toFixed(1)}R` : `${rr.toFixed(1)}R`;
    const parts = [`${trade.pair} ${trade.direction}`, rrStr, trade.status];
    if (n > 0) parts.push(`${n} confluences`);
    const line = parts.join(" · ");
    void navigator.clipboard.writeText(line);
    toast.success("Copied to clipboard.");
  }, [trade]);

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = () => {
    deleteTrade(trade.id);
    toast.error("Trade Deleted");
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const createDuplicatedTrade = React.useCallback((): Trade => ({
    ...trade,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "Open",
    exitPrice: undefined,
    rrRealized: undefined,
    pnlAmount: undefined,
  }), [trade]);

  const handleDuplicate = () => {
    addTrade(createDuplicatedTrade());
    toast.success("Trade duplicated", { description: "New open trade added from this one." });
  };

  const handleDuplicateAndEdit = () => {
    const duplicated = createDuplicatedTrade();
    onOpenChange(false);
    window.dispatchEvent(
      new CustomEvent(OPEN_ADD_TRADE_WITH_INITIAL_EVENT, {
        detail: { initialData: duplicated },
      })
    );
    toast.success("Opening form with duplicated trade");
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
          setEditSnapshot(null);
          setIsClosing(false);
          setReflectionOpen(false);
          setVisualsOpen(false);
          setShowDeleteConfirm(false);
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
        <div className="flex-1 overflow-hidden flex flex-col w-full min-h-0 bg-card relative border-l-2 border-primary-accent/20">
          {showDeleteConfirm && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
              role="alertdialog"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
            >
              <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
                <h3 id="delete-dialog-title" className="text-lg font-semibold text-foreground">
                  Delete trade?
                </h3>
                <p id="delete-dialog-desc" className="text-sm text-muted-foreground">
                  This cannot be undone. The trade will be removed from your journal.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    ref={cancelDeleteRef}
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DetailHeader
            trade={trade}
            isEditing={isEditing}
            onEdit={handleEditStart}
            onDone={() => setIsEditing(false)}
            onCancelEdit={isEditing ? handleCancelEdit : undefined}
            onDelete={handleDeleteClick}
            onDuplicate={handleDuplicate}
            onDuplicateAndEdit={handleDuplicateAndEdit}
            onClose={() => onOpenChange(false)}
            onCopySummary={handleCopySummary}
            closeButtonRef={closeButtonRef}
          />

          <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
            <div className="p-4 md:p-6 space-y-8">
              {isEditing && (
                <IdentitySection
                  trade={trade}
                  isEditing={isEditing}
                  onUpdate={handleUpdate}
                />
              )}
              <div>
                <MetricTiles
                  trade={trade}
                  isEditing={isEditing}
                  onUpdate={handleUpdate}
                />
              </div>

              {(() => {
                const n = trade.confluences?.length ?? 0;
                const parts: string[] = [];
                if (n) parts.push(`${n} confluences`);
                if (trade.lessonLearned) parts.push("Lesson");
                if (trade.notes) parts.push("Notes");
                const reflectionSummary = parts.length ? parts.join(" · ") : "None";
                return (
                  <CollapsibleSection
                    id="reflection-section"
                    title="Reflection"
                    summary={reflectionSummary}
                    open={reflectionOpen}
                    onToggle={() => setReflectionOpen((x) => !x)}
                    icon={MessageSquare}
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
                    id="visuals-section"
                    title="Visuals"
                    summary={visualsSummary}
                    open={visualsOpen}
                    onToggle={() => setVisualsOpen((x) => !x)}
                    icon={ImageIcon}
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
