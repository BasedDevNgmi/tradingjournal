"use client";

import { X, Zap, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TabType } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { SIDEBAR_NAV_ITEMS } from "@/components/layout/nav-config";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSettingsClick: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onSettingsClick,
}: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mobile-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="mobile-sidebar-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border shadow-md p-6 flex flex-col gap-6 rounded-r-xl z-[151] lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-accent rounded-lg flex items-center justify-center shrink-0">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none">Trading Journal</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-4 mb-4">Navigation</p>
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id as TabType);
                  onClose();
                }}
                className={cn(
                  "relative w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-accent text-white border-l-2 border-l-white/90 rounded-r-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0"><Icon size={18} /></span>
                  {item.label}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-background animate-pulse shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-border/50 space-y-4">
          <button 
            onClick={() => {
              onSettingsClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Settings size={18} />
            Settings
          </button>
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground leading-none">Theme</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
