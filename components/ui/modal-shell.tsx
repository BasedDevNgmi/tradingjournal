"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MODAL_CONTENT_BASE =
  "p-0 overflow-hidden border border-border shadow-xl flex flex-col rounded-xl bg-card min-h-0";

export const modalContentClass = {
  add: cn(MODAL_CONTENT_BASE, "sm:max-w-[960px] h-[90dvh]"),
  detail: cn(MODAL_CONTENT_BASE, "sm:max-w-[980px] h-[85dvh]"),
};

interface ModalShellProps {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
  /** When true, renders only the scrollable body (no header). */
  bodyOnly?: boolean;
}

export function ModalShell({
  title,
  onClose,
  children,
  bodyClassName,
  bodyOnly = false,
}: ModalShellProps) {
  if (bodyOnly) {
    return (
      <div className={cn("flex-1 overflow-y-auto scrollbar-thin min-h-0", bodyClassName)}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full">
      {(title != null || onClose != null) && (
        <header className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/30">
          {title != null && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          {onClose != null && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </header>
      )}
      <div
        className={cn(
          "flex-1 overflow-y-auto scrollbar-thin min-h-0",
          bodyClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
