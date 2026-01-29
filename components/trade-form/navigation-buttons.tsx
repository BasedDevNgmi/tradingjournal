"use client";

import { ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onDeployClick: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
  /** One-line summary shown above footer when on last step (e.g. "BTC/USDT Long · 2.1R · Win") */
  summaryLine?: string;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onDeployClick,
  isSubmitting,
  isEdit,
  summaryLine,
}: NavigationButtonsProps) {
  return (
    <div className="p-6 bg-gradient-to-t from-card via-card to-transparent pt-16 z-30 flex flex-col gap-3">
      {currentStep === totalSteps && summaryLine && (
        <p className="text-xs font-medium text-muted-foreground text-center px-2" aria-live="polite">
          {summaryLine}
        </p>
      )}
      <div className="flex gap-3">
      {currentStep > 1 && (
        <Button
          type="button"
          onClick={onPrev}
          variant="outline"
          disabled={isSubmitting}
          className="h-12 px-6 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary-accent/40"
        >
          Back
        </Button>
      )}

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className="flex-1 h-12 text-sm font-medium rounded-lg bg-primary-accent text-white hover:opacity-90 shadow-md transition-opacity focus-visible:ring-2 focus-visible:ring-primary-accent/40 inline-flex items-center justify-center gap-2"
        >
          Next Step
          <ChevronRight size={16} className="shrink-0" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onDeployClick}
          disabled={isSubmitting}
          className="flex-1 h-12 text-sm font-medium rounded-lg bg-primary-accent text-white hover:opacity-90 shadow-md transition-opacity focus-visible:ring-2 focus-visible:ring-primary-accent/40 inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="shrink-0 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check size={16} className="shrink-0" />
              {isEdit ? "Update Entry" : "Deploy Entry"}
            </>
          )}
        </Button>
      )}
      </div>
    </div>
  );
}
