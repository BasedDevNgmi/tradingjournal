"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Identity", "Playbook", "Execution", "Reflection"] as const;

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  return (
    <div className="px-8 pt-4">
      <div className="flex items-center gap-1.5 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isDone = currentStep > step;
          const isCurrent = currentStep === step;
          return (
            <div key={step} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: currentStep >= step ? "100%" : "0%" }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "h-full rounded-full",
                  isDone ? "bg-primary-accent" : isCurrent ? "bg-primary-accent" : "bg-transparent"
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between px-0.5">
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => {
          const step = i + 1;
          const isDone = currentStep > step;
          const isCurrent = currentStep === step;
          return (
            <span
              key={step}
              className={cn(
                "text-[10px] font-medium transition-colors",
                isCurrent ? "text-foreground" : isDone ? "text-primary-accent" : "text-muted-foreground/70"
              )}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
