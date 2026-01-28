"use client";

import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  onPrev, 
  onNext, 
  isSubmitting, 
  isEdit 
}: NavigationButtonsProps) {
  return (
    <div className="p-6 bg-gradient-to-t from-card via-card to-transparent pt-16 z-30 flex gap-3">
      {currentStep > 1 && (
        <Button 
          type="button" 
          onClick={onPrev}
          variant="outline"
          className="h-12 px-6 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Back
        </Button>
      )}
      
      {currentStep < totalSteps ? (
        <Button 
          type="button" 
          onClick={onNext}
          className="flex-1 h-12 text-sm font-medium rounded-lg bg-primary-accent text-white hover:opacity-90 shadow-md transition-opacity"
        >
          Next Step
        </Button>
      ) : (
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 h-12 text-sm font-medium rounded-lg bg-primary-accent text-white hover:opacity-90 shadow-md transition-opacity"
        >
          {isEdit ? "Update Entry" : "Deploy Entry"}
        </Button>
      )}
    </div>
  );
}
