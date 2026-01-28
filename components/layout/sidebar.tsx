"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings, Zap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SIDEBAR_NAV_ITEMS } from "@/components/layout/nav-config";
import { TabType } from "@/types";

const STAGGER_MS = 40;

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSettingsClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeTab, onTabChange, onSettingsClick, isCollapsed, onToggleCollapse }: SidebarProps) {
  const navItems = SIDEBAR_NAV_ITEMS;
  const showExpandedInAside = !isCollapsed;

  return (
    <div className="hidden lg:flex h-full w-full shrink-0 z-[100]">
      <aside
        className={cn(
          "flex flex-col h-full w-full min-w-0 bg-muted/5 border-r border-border sticky top-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
      >
        {/* Header: logo only (centered when collapsed); logo + title when expanded. Toggle lives in footer. */}
        <div
          className={cn(
            "h-[72px] flex items-center shrink-0 transition-all duration-500",
            showExpandedInAside ? "justify-between px-6" : "justify-center px-3"
          )}
        >
          <div className={cn("flex items-center min-w-0", showExpandedInAside ? "gap-3" : "justify-center")}>
            <div className="w-9 h-9 bg-primary-accent rounded-lg flex items-center justify-center shrink-0">
              <Zap size={18} className="text-white fill-current" />
            </div>
            {showExpandedInAside && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col whitespace-nowrap min-w-0"
              >
                <span className="text-sm font-semibold text-foreground leading-none truncate">Trading Journal</span>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 mt-2" aria-label="Main">
          {showExpandedInAside && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.02 }}
              className="text-xs font-medium text-muted-foreground mb-2 px-3"
            >
              Navigation
            </motion.p>
          )}
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={!showExpandedInAside ? item.label : undefined}
                  aria-label={item.label}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    !showExpandedInAside ? "justify-center" : "gap-3",
                    isActive
                      ? "bg-primary-accent text-white border-l-2 border-l-white/90 rounded-r-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="shrink-0"><Icon size={18} /></span>
                  {showExpandedInAside && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * (STAGGER_MS / 1000) }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer: collapsed = stack 3 icons vertically to fit rail; expanded = row */}
        <div className={cn("shrink-0", showExpandedInAside ? "p-3" : "px-2 py-3")}>
          <div
            className={cn(
              "flex items-center gap-1",
              showExpandedInAside ? "flex-row justify-center h-12" : "flex-col gap-0.5"
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 flex items-center justify-center"
              title={showExpandedInAside ? "Collapse sidebar" : "Expand sidebar"}
              aria-label={showExpandedInAside ? "Collapse sidebar" : "Expand sidebar"}
            >
              {showExpandedInAside ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            <div className={cn("shrink-0 flex items-center justify-center", !showExpandedInAside && "p-2")}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
