"use client";

import { cn } from "@/lib/utils";
import { PSYCHO_TAGS } from "@/lib/constants";
import { UseFormReturn } from "react-hook-form";
import { TradeFormValues } from "./schema";
import { ImageUpload } from "@/components/ui/image-upload";

interface Step4ReflectionProps {
  form: UseFormReturn<TradeFormValues>;
  toggleArrayItem: (fieldName: "psychoTags" | "confluences", item: string) => void;
}

export function Step4Reflection({ form, toggleArrayItem }: Step4ReflectionProps) {
  const { register, watch, setValue } = form;
  const formData = watch();

  return (
    <div className="space-y-8">
      <div className="space-y-1 border-b border-border pb-6 pr-12">
        <h3 className="text-lg font-semibold">4. Reflection</h3>
        <p className="text-xs font-medium text-muted-foreground">Final details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Mental state</label>
            <div className="flex flex-wrap gap-2">
              {PSYCHO_TAGS.map((tag) => {
                const isSelected = formData.psychoTags?.includes(tag);
                const isPositive = tag === 'Disciplined';
                const isNegative = ['FOMO', 'Revenge Trade', 'Chasing'].includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleArrayItem("psychoTags", tag)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                      isSelected 
                        ? isPositive ? "bg-success border-success text-white shadow-md" :
                          isNegative ? "bg-danger border-danger text-white shadow-md" :
                          "bg-primary-accent border-primary-accent text-white shadow-md"
                        : "bg-card text-muted-foreground border-border hover:border-muted-foreground/30"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Context or quote..."
              rows={2}
              className="w-full p-4 text-sm font-medium bg-muted/20 border border-border rounded-xl outline-none focus:border-primary-accent transition-colors resize-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Takeaway</label>
            <textarea
              {...register("lessonLearned")}
              placeholder="The #1 lesson..."
              rows={2}
              className="w-full p-4 text-sm font-medium bg-muted/20 border border-border rounded-xl outline-none focus:border-primary-accent transition-colors resize-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {['before', 'after'].map((type) => (
              <div key={type} className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">{type} chart</label>
                <ImageUpload 
                  value={watch(type === 'before' ? "beforeScreenshotUrl" : "afterScreenshotUrl")} 
                  onChange={(val) => setValue(type === 'before' ? "beforeScreenshotUrl" : "afterScreenshotUrl", val)} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
