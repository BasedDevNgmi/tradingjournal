"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, BookOpen, BarChart3, Plus, Clock, Terminal, Zap, Settings } from "lucide-react";
import { useJournalNavigation } from "@/hooks/use-journal-navigation";
import { useJournalFilters } from "@/hooks/use-journal-filters";
import { useTradesData } from "@/context/trade-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const { setActiveTab, setIsSettingsOpen, setIsAddModalOpen } = useJournalNavigation();
  const { resetFilters, setSearchQuery } = useJournalFilters(setActiveTab);
  const { trades } = useTradesData();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ type: "tween", duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl relative"
          >
            <Command className="w-full bg-card border border-border shadow-md rounded-xl overflow-hidden">
              <div className="flex items-center px-4 border-b border-border/40">
                <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="w-full h-14 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/40"
                />
                <div className="flex items-center gap-1.5 ml-3">
                  <span className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs font-medium text-muted-foreground">ESC</span>
                </div>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
                <Command.Empty className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <Terminal size={24} className="opacity-20" />
                  <p>No results found for this query.</p>
                </Command.Empty>

                <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <CommandItem onSelect={() => runCommand(() => setActiveTab('journal'))} icon={BookOpen} label="Journal" />
                  <CommandItem onSelect={() => runCommand(() => setActiveTab('missed'))} icon={Clock} label="Missed setups" />
                  <CommandItem onSelect={() => runCommand(() => setActiveTab('analytics'))} icon={BarChart3} label="Analytics" />
                  <CommandItem onSelect={() => runCommand(() => setIsSettingsOpen(true))} icon={Settings} label="System settings" />
                </Command.Group>

                <Command.Group heading="Actions" className="px-2 py-1.5 mt-2 text-xs font-medium text-muted-foreground">
                  <CommandItem onSelect={() => runCommand(() => setIsAddModalOpen(true))} icon={Plus} label="Log trade" shortcut="⌘N" color="text-primary-accent" />
                  <CommandItem onSelect={() => runCommand(() => resetFilters())} icon={Zap} label="Reset filters" />
                </Command.Group>

                {trades.length > 0 && (
                  <Command.Group heading="Recent trades" className="px-2 py-1.5 mt-2 text-xs font-medium text-muted-foreground">
                    {trades.slice(0, 5).map((trade) => (
                      <CommandItem
                        key={trade.id}
                        onSelect={() => runCommand(() => {
                          setSearchQuery(trade.pair);
                          setActiveTab('journal');
                        })}
                        icon={Zap}
                        label={`${trade.pair} - ${trade.status}`}
                        shortcut={new Date(trade.date).toLocaleDateString()}
                      />
                    ))}
                  </Command.Group>
                )}
              </Command.List>
              <div className="px-4 py-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20">
                <span>Type to search commands and trades</span>
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-medium">⌘K</kbd>
                  <span>open</span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-medium ml-1">ESC</kbd>
                  <span>close</span>
                </span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ icon: Icon, label, onSelect, shortcut, color }: { icon: any, label: string, onSelect: () => void, shortcut?: string, color?: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-default select-none outline-none aria-selected:bg-primary-accent aria-selected:text-white transition-colors",
        color
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs font-medium opacity-50">{shortcut}</span>
      )}
    </Command.Item>
  );
}
