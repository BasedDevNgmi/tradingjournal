"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  return (
    <div className="px-8 pt-4 flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        return (
          <div key={step} className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: currentStep >= step ? "100%" : "0%" }}
              className={cn(
                "h-full transition-colors duration-500",
                currentStep >= step ? "bg-primary-accent" : "bg-transparent"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
