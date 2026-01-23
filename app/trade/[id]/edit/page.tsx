"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTrades } from "@/context/trade-context";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { PSYCHO_TAGS } from "@/lib/constants";

const tradeSchema = z.object({
  pair: z.string().min(1, "Pair is required (e.g. BTC/USDT)"),
  direction: z.enum(["Long", "Short"]),
  entryPrice: z.number().positive("Entry must be positive"),
  stopLoss: z.number().positive("SL must be positive"),
  takeProfit: z.number().positive("TP must be positive"),
  setupType: z.string().min(1, "Setup type is required"),
  confluences: z.string().optional(),
  notes: z.string().optional(),
  screenshotUrl: z.string().optional(),
  psychoTags: z.array(z.string()).default([]),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

export default function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { trades, updateTrade } = useTrades();
  const [calculatedRR, setCalculatedRR] = useState<number | null>(null);

  const trade = trades.find((t) => t.id === id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      psychoTags: [],
    },
  });

  useEffect(() => {
    if (trade) {
      reset({
        pair: trade.pair,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        setupType: trade.setupType,
        confluences: trade.confluences.join(", "),
        notes: trade.notes || "",
        screenshotUrl: trade.screenshotUrl || "",
        psychoTags: trade.psychoTags || [],
      });
    }
  }, [trade, reset]);

  const watchAllFields = watch();
  const direction = watch("direction");
  const selectedPsychoTags = watch("psychoTags") || [];

  const togglePsychoTag = (tag: string) => {
    const currentTags = [...selectedPsychoTags];
    const index = currentTags.indexOf(tag);
    if (index === -1) {
      currentTags.push(tag);
    } else {
      currentTags.splice(index, 1);
    }
    setValue("psychoTags", currentTags);
  };

  // R:R Calculation Logic
  useEffect(() => {
    const { entryPrice, stopLoss, takeProfit, direction } = watchAllFields;
    
    if (entryPrice && stopLoss && takeProfit) {
      let rr = 0;
      if (direction === "Long") {
        const risk = entryPrice - stopLoss;
        const reward = takeProfit - entryPrice;
        if (risk > 0) rr = reward / risk;
      } else {
        const risk = stopLoss - entryPrice;
        const reward = entryPrice - takeProfit;
        if (risk > 0) rr = reward / risk;
      }
      setCalculatedRR(rr > 0 ? parseFloat(rr.toFixed(2)) : null);
    } else {
      setCalculatedRR(null);
    }
  }, [watchAllFields]);

  if (!trade) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase text-black">Trade not found</h1>
        <Button onClick={() => router.push("/")}>Back to Journal</Button>
      </div>
    );
  }

  const onSubmit = (data: TradeFormValues) => {
    updateTrade(id, {
      pair: data.pair.toUpperCase(),
      direction: data.direction,
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      rrPredicted: calculatedRR || 0,
      setupType: data.setupType,
      confluences: data.confluences ? data.confluences.split(',').map(s => s.trim()) : [],
      notes: data.notes,
      screenshotUrl: data.screenshotUrl,
      psychoTags: data.psychoTags,
    });

    toast.success("Trade Updated!", {
      description: `${data.pair.toUpperCase()} has been saved.`
    });
    router.push(`/trade/${id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 text-black">
        <button 
          type="button"
          onClick={() => router.push(`/trade/${id}`)}
          className="p-2 border-2 border-black bg-white hover:bg-zinc-100 transition-all active:translate-y-1"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Edit Trade</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Section 1: Pair & Direction */}
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Trading Pair</label>
            <input
              {...register("pair")}
              placeholder="e.g. BTC/USDT"
              className={cn(
                "w-full p-4 text-xl font-black uppercase border-4 border-black bg-white text-black outline-none focus:bg-yellow-50 transition-colors",
                errors.pair && "border-red-500"
              )}
            />
            {errors.pair && <p className="text-red-600 text-xs font-bold uppercase">{errors.pair.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Direction</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("direction", "Long")}
                className={cn(
                  "p-4 text-xl font-black uppercase border-4 border-black transition-all active:translate-y-1",
                  direction === "Long" 
                    ? "bg-green-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    : "bg-white text-zinc-400 border-zinc-200"
                )}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setValue("direction", "Short")}
                className={cn(
                  "p-4 text-xl font-black uppercase border-4 border-black transition-all active:translate-y-1",
                  direction === "Short" 
                    ? "bg-red-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    : "bg-white text-zinc-400 border-zinc-200"
                )}
              >
                Short
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Numbers & RR */}
        <section className="p-6 border-4 border-black bg-zinc-50 space-y-6 relative overflow-hidden transition-colors text-black">
          <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-black uppercase tracking-widest">
            Price Levels
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Entry</label>
              <input
                type="number"
                step="any"
                {...register("entryPrice", { valueAsNumber: true })}
                className="w-full p-3 font-black border-2 border-black bg-white text-black outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Stop Loss</label>
              <input
                type="number"
                step="any"
                {...register("stopLoss", { valueAsNumber: true })}
                className="w-full p-3 font-black border-2 border-black bg-white text-black outline-none focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Take Profit</label>
              <input
                type="number"
                step="any"
                {...register("takeProfit", { valueAsNumber: true })}
                className="w-full p-3 font-black border-2 border-black bg-white text-black outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black flex justify-between items-center text-black">
            <span className="text-sm font-black uppercase italic">Potential Risk/Reward:</span>
            <div className={cn(
              "text-4xl font-black tracking-tighter",
              calculatedRR && calculatedRR >= 2 ? "text-green-600" : "text-black"
            )}>
              {calculatedRR ? `${calculatedRR}R` : "--"}
            </div>
          </div>
        </section>

        {/* Section 3: Setup & Confluences */}
        <section className="space-y-6 text-black">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Setup Type</label>
            <input
              {...register("setupType")}
              placeholder="e.g. SFP, Range Rotation"
              className="w-full p-4 text-lg font-bold border-4 border-black bg-white outline-none focus:bg-yellow-50"
            />
            {errors.setupType && <p className="text-red-600 text-xs font-bold uppercase">{errors.setupType.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Confluences</label>
            <textarea
              {...register("confluences")}
              placeholder="VWAP, Daily Open, Fib 0.618..."
              rows={3}
              className="w-full p-4 text-lg font-bold border-4 border-black bg-white outline-none focus:bg-yellow-50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Any extra thoughts..."
              rows={2}
              className="w-full p-4 text-lg font-bold border-4 border-black bg-white outline-none focus:bg-yellow-50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Trading Psychology</label>
            <div className="flex flex-wrap gap-2">
              {PSYCHO_TAGS.map((tag) => {
                const isSelected = selectedPsychoTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePsychoTag(tag)}
                    className={cn(
                      "px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-black transition-all active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      isSelected ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-50"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Screenshot</label>
            <ImageUpload 
              value={watch("screenshotUrl")} 
              onChange={(val) => setValue("screenshotUrl", val)} 
            />
          </div>
        </section>

        <Button 
          type="submit" 
          className="w-full h-20 text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Save className="mr-2" size={32} strokeWidth={4} />
          Update Trade
        </Button>
      </form>
    </div>
  );
}
