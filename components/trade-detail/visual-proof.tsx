"use client";

import * as React from "react";
import { Trade } from "@/types";
import { Image as ImageIcon, Activity, X } from "lucide-react";
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
  const [lightbox, setLightbox] = React.useState<{ url: string; alt: string } | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!lightbox) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

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
              <button
                type="button"
                onClick={() => setLightbox({ url: trade.beforeScreenshotUrl!, alt: "Setup" })}
                className="group relative rounded-xl border border-border/50 overflow-hidden bg-muted aspect-video shadow-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
              >
                <img
                  src={trade.beforeScreenshotUrl}
                  alt="Setup"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary-accent/90 text-xs font-medium text-white">
                  Setup
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 aspect-video flex flex-col items-center justify-center gap-2 bg-muted/10">
                <ImageIcon size={20} strokeWidth={1.5} className="text-muted-foreground/40" />
                <span className="text-sm font-medium text-muted-foreground/60">No setup</span>
              </div>
            )}

            {trade.afterScreenshotUrl ? (
              <button
                type="button"
                onClick={() => setLightbox({ url: trade.afterScreenshotUrl!, alt: "Result" })}
                className="group relative rounded-xl border border-border/50 overflow-hidden bg-muted aspect-video shadow-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
              >
                <img
                  src={trade.afterScreenshotUrl}
                  alt="Result"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary-accent/90 text-xs font-medium text-white">
                  Result
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 aspect-video flex flex-col items-center justify-center gap-2 bg-muted/10">
                <Activity size={20} strokeWidth={1.5} className="text-muted-foreground/40" />
                <span className="text-sm font-medium text-muted-foreground/60">No result</span>
              </div>
            )}
          </>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Image: ${lightbox.alt}`}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 z-10"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute inset-0 -z-[1]"
            aria-hidden
            tabIndex={-1}
          />
          <img
            src={lightbox.url}
            alt={lightbox.alt}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
