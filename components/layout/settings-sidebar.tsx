"use client";

import * as React from "react";
import { X, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DataManagement } from "@/components/data-management";
import { useTradesUI } from "@/context/trade-context";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {
  const { isGhostMode, toggleGhostMode } = useTradesUI();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="settings-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[20rem] bg-card border-l border-border z-[101] shadow-md p-8 space-y-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent transition-colors active:scale-95 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-8 overflow-y-auto scrollbar-thin max-h-[calc(100dvh-120px)]">
              <section className="space-y-4">
                <h3 className="text-xs font-medium text-muted-foreground">Privacy</h3>
                <button 
                  onClick={toggleGhostMode}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <EyeOff size={16} className={cn(isGhostMode ? "text-primary-accent" : "text-muted-foreground")} />
                    <div className="text-left">
                      <p className="text-sm font-medium">Privacy blur</p>
                      <p className="text-xs font-medium text-muted-foreground/60">Blur trade details and charts when screen is visible to others</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                    isGhostMode ? "bg-primary-accent" : "bg-muted-foreground/20"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-2 h-2 rounded-full bg-background transition-all duration-300",
                      isGhostMode ? "left-5" : "left-1"
                    )} />
                  </div>
                </button>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-medium text-muted-foreground">Data Management</h3>
                <DataManagement />
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
