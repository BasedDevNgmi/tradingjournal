"use client";

import * as React from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trade } from "@/types";
import { calculateRR, getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { AnimatePresence, motion } from "framer-motion";
import { tradeFormSchema, TradeFormValues } from "./schema";
import { FormProgress } from "./form-progress";
import { NavigationButtons } from "./navigation-buttons";
import { Step1Identity } from "./step1-identity";
import { Step2Playbook } from "./step2-playbook";
import { Step3Execution } from "./step3-execution";
import { Step4Reflection } from "./step4-reflection";
export type { TradeFormValues };

interface TradeFormProps {
  initialData?: Trade;
  onSubmit: (data: TradeFormValues, calculatedRR: number) => void;
  isSubmitting?: boolean;
}

export function TradeForm({ initialData, onSubmit, isSubmitting }: TradeFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema) as Resolver<TradeFormValues>,
    mode: "onChange",
    defaultValues: initialData ? {
      pair: initialData.pair || "BTC/USDT",
      direction: initialData.direction || "Long",
      entryPrice: initialData.entryPrice,
      stopLoss: initialData.stopLoss,
      takeProfit: initialData.takeProfit,
      confluences: initialData.confluences || [],
      notes: initialData.notes || "",
      lessonLearned: initialData.lessonLearned || "",
      beforeScreenshotUrl: initialData.beforeScreenshotUrl || "",
      afterScreenshotUrl: initialData.afterScreenshotUrl || "",
      psychoTags: initialData.psychoTags || [],
      pnlAmount: initialData.pnlAmount,
      currency: initialData.currency || "USD",
      isMissed: initialData.status === 'Missed',
      riskPercent: initialData.riskPercent || 1,
      session: initialData.session,
    } : {
      pair: "BTC/USDT",
      direction: "Long",
      psychoTags: [],
      confluences: [],
      currency: "USD",
      isMissed: false,
      riskPercent: 1,
      session: (() => {
        const hour = new Date().getUTCHours();
        if (hour >= 0 && hour < 8) return "Asia";
        if (hour >= 8 && hour < 14) return "London";
        return "New York";
      })() as any,
    },
  });

  const { watch, setValue, trigger, handleSubmit } = form;
  const formData = watch();
  
  const calculatedRR = React.useMemo(() => {
    return calculateRR({ 
      entryPrice: formData.entryPrice, 
      stopLoss: formData.stopLoss, 
      takeProfit: formData.takeProfit, 
      direction: formData.direction 
    });
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.direction]);

  const setupQuality = React.useMemo(() => {
    const level = getQualityLevel(formData.confluences);
    const style = getQualityLevelStyle(level);
    return {
      level,
      risk: style.riskLabel,
      color: style.colorClass,
      bgColor: style.bgColor,
      label: style.formLabel,
    };
  }, [formData.confluences]);

  const toggleArrayItem = (fieldName: "psychoTags" | "confluences", item: string) => {
    const currentItems = formData[fieldName] || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    setValue(fieldName, newItems, { shouldValidate: true });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["pair", "session"];
    if (currentStep === 3) fieldsToValidate = ["entryPrice", "stopLoss", "takeProfit", "riskPercent"];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  React.useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              if (!formData.beforeScreenshotUrl) setValue("beforeScreenshotUrl", result);
              else if (!formData.afterScreenshotUrl) setValue("afterScreenshotUrl", result);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [formData.beforeScreenshotUrl, formData.afterScreenshotUrl, setValue]);

  const stepVariants = {
    hidden: { x: 16, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -16, opacity: 0 }
  };
  const stepTransition = { type: "tween" as const, duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div className="relative flex flex-col h-full bg-card">
      <FormProgress currentStep={currentStep} totalSteps={4} />

      <form onSubmit={handleSubmit((data) => {
        onSubmit(data, calculatedRR);
      })} className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={stepTransition}
              className="h-full"
            >
              {currentStep === 1 && <Step1Identity form={form} />}
              {currentStep === 2 && <Step2Playbook form={form} setupQuality={setupQuality} toggleArrayItem={toggleArrayItem} />}
              {currentStep === 3 && <Step3Execution form={form} calculatedRR={calculatedRR} />}
              {currentStep === 4 && <Step4Reflection form={form} toggleArrayItem={toggleArrayItem} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <NavigationButtons 
          currentStep={currentStep}
          totalSteps={4}
          onPrev={prevStep}
          onNext={nextStep}
          isSubmitting={isSubmitting}
          isEdit={!!initialData}
        />
      </form>
    </div>
  );
}
