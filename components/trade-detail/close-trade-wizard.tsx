"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CloseTradeWizardProps {
  onCloseTrade: (status: 'Win' | 'Loss' | 'Breakeven', exitPrice: string, followedPlan: boolean, feeling: string) => void;
  onCancel: () => void;
}

export function CloseTradeWizard({ onCloseTrade, onCancel }: CloseTradeWizardProps) {
  const [step, setStep] = React.useState(1);
  const [exitPrice, setExitPrice] = React.useState("");
  const [followedPlan, setFollowedPlan] = React.useState<boolean | null>(null);
  const [feeling, setFeeling] = React.useState("");

  const handleFinish = (status: 'Win' | 'Loss' | 'Breakeven') => {
    onCloseTrade(status, exitPrice, followedPlan ?? true, feeling);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-md space-y-6 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-primary-accent transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
      
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary-accent text-white flex items-center justify-center text-xs font-semibold">1</span>
            <h4 className="text-section">Exit price</h4>
          </div>
          <input 
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="w-full p-0 py-2 border-b border-muted bg-transparent font-semibold outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent/20 text-2xl tracking-tight transition-colors"
            placeholder="0.0000"
            autoFocus
          />
          <Button className="w-full h-12 rounded-lg text-sm font-medium bg-primary-accent text-white hover:opacity-90" disabled={!exitPrice} onClick={() => setStep(2)}>
            Next step
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-accent text-white flex items-center justify-center text-xs font-semibold">2</span>
            <h4 className="text-section">Discipline</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setFollowedPlan(true); setStep(3); }} className={cn("p-5 rounded-lg border flex flex-col items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background", followedPlan === true ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted border-border text-muted-foreground")}>
              <CheckCircle2 size={22} />
              <span className="text-sm font-medium">Yes</span>
            </button>
            <button onClick={() => { setFollowedPlan(false); setStep(3); }} className={cn("p-5 rounded-lg border flex flex-col items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background", followedPlan === false ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-muted border-border text-muted-foreground")}>
              <XCircle size={22} />
              <span className="text-sm font-medium">No</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary-accent text-white flex items-center justify-center text-xs font-semibold">3</span>
            <h4 className="text-section">Review</h4>
          </div>
          <textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} className="w-full p-4 bg-muted border border-border rounded-lg font-medium outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent/20 text-sm resize-none transition-colors" rows={3} placeholder="Mindset check..." />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleFinish('Win')} className="bg-emerald-500 text-white rounded-lg p-3 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Win</button>
            <button onClick={() => handleFinish('Loss')} className="bg-rose-500 text-white rounded-lg p-3 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">Loss</button>
          </div>
        </div>
      )}

      <button onClick={onCancel} className="w-full text-xs font-medium text-muted-foreground mt-2 hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg py-2">Cancel</button>
    </div>
  );
}
