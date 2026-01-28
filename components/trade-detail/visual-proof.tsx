"use client";

import { Trade } from "@/types";
import { Image as ImageIcon, Activity } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface VisualProofProps {
  trade: Trade;
  isEditing?: boolean;
  onUpdate?: (partial: Partial<Trade>) => void;
}

export function VisualProof({
  trade,
  isEditing = false,
  onUpdate,
}: VisualProofProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground/40">
        <ImageIcon size={12} />
        <h3 className="text-xs font-semibold">Visuals</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {isEditing && onUpdate ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">Setup</label>
              <ImageUpload
                value={trade.beforeScreenshotUrl ?? ""}
                onChange={(v) => onUpdate({ beforeScreenshotUrl: v || undefined })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">Result</label>
              <ImageUpload
                value={trade.afterScreenshotUrl ?? ""}
                onChange={(v) => onUpdate({ afterScreenshotUrl: v || undefined })}
              />
            </div>
          </>
        ) : (
          <>
            {trade.beforeScreenshotUrl ? (
              <div className="group relative rounded-xl border border-border/50 overflow-hidden bg-muted aspect-video shadow-sm">
                <img
                  src={trade.beforeScreenshotUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary-accent/90 text-xs font-medium text-white">
                  Setup
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 aspect-video flex flex-col items-center justify-center gap-2 bg-muted/10">
                <ImageIcon size={20} strokeWidth={1.5} className="text-muted-foreground/40" />
                <span className="text-sm font-medium text-muted-foreground/60">No setup</span>
              </div>
            )}

            {trade.afterScreenshotUrl ? (
              <div className="group relative rounded-xl border border-border/50 overflow-hidden bg-muted aspect-video shadow-sm">
                <img
                  src={trade.afterScreenshotUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary-accent/90 text-xs font-medium text-white">
                  Result
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 aspect-video flex flex-col items-center justify-center gap-2 bg-muted/10">
                <Activity size={20} strokeWidth={1.5} className="text-muted-foreground/40" />
                <span className="text-sm font-medium text-muted-foreground/60">No result</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
