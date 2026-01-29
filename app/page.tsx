"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { TradeList } from "@/components/trade-list";
import { Plus } from "lucide-react";

import { AnalyticsSkeleton } from "@/components/analytics-skeleton";
const AnalyticsView = dynamic(
  () => import("@/components/analytics-view").then((m) => ({ default: m.AnalyticsView })),
  { ssr: false, loading: () => <AnalyticsSkeleton /> }
);
import { AddTradeModal } from "@/components/add-trade-modal";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { useJournalNavigation } from "@/hooks/use-journal-navigation";
import { useJournalFilters } from "@/hooks/use-journal-filters";
import { JournalHeader } from "@/components/layout/journal-header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { SettingsSidebar } from "@/components/layout/settings-sidebar";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GlobalErrorBoundary } from "@/components/ui/error-boundary";
import { OPEN_ADD_TRADE_EVENT, OPEN_ADD_TRADE_WITH_INITIAL_EVENT, TOGGLE_SIDEBAR_EVENT } from "@/components/keyboard-shortcuts";
import { Trade } from "@/types";

export default function Home() {
  const { 
    activeTab, setActiveTab,
    isSettingsOpen, setIsSettingsOpen,
    isAddModalOpen, setIsAddModalOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isMobileSearchOpen, setIsMobileSearchOpen,
    mounted,
    searchInputRef,
    focusSearch,
    toggleSidebar
  } = useJournalNavigation();

  const {
    filter, setFilter,
    dateRange, setDateRange,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    selectedSetup, setSelectedSetup,
    selectedPair, setSelectedPair,
    selectedDirection, setSelectedDirection,
    selectedNewsDay, setSelectedNewsDay,
    selectedNewsEvent, setSelectedNewsEvent,
    handleStatClick,
    resetFilters
  } = useJournalFilters(setActiveTab);

  const [addModalInitialData, setAddModalInitialData] = React.useState<Partial<Trade> | null>(null);

  // Listen for global "N" shortcut to open add-trade modal (from layout keyboard-shortcuts)
  React.useEffect(() => {
    const onOpenAddTrade = () => setIsAddModalOpen(true);
    window.addEventListener(OPEN_ADD_TRADE_EVENT, onOpenAddTrade);
    return () => window.removeEventListener(OPEN_ADD_TRADE_EVENT, onOpenAddTrade);
  }, [setIsAddModalOpen]);

  // Listen for "open add modal with initial data" (e.g. from detail modal "Duplicate and edit")
  React.useEffect(() => {
    const onOpenWithInitial = (e: Event) => {
      const customEvent = e as CustomEvent<{ initialData: Partial<Trade> }>;
      if (customEvent.detail?.initialData) {
        setAddModalInitialData(customEvent.detail.initialData);
        setIsAddModalOpen(true);
      }
    };
    window.addEventListener(OPEN_ADD_TRADE_WITH_INITIAL_EVENT, onOpenWithInitial);
    return () => window.removeEventListener(OPEN_ADD_TRADE_WITH_INITIAL_EVENT, onOpenWithInitial);
  }, [setIsAddModalOpen]);

  // Listen for Mod+B to toggle sidebar (from layout keyboard-shortcuts)
  React.useEffect(() => {
    const onToggleSidebar = () => toggleSidebar();
    window.addEventListener(TOGGLE_SIDEBAR_EVENT, onToggleSidebar);
    return () => window.removeEventListener(TOGGLE_SIDEBAR_EVENT, onToggleSidebar);
  }, [toggleSidebar]);

  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.2 };

  if (!mounted) return null;

  return (
    <div className="h-screen min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 transition-colors duration-300 overflow-hidden relative">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar: click-only collapse/expand; width from persisted state */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-[100] lg:relative lg:block shrink-0 border-r border-border/10 bg-muted/5 backdrop-blur-md transition-[width] duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}>
          <Sidebar 
            activeTab={activeTab} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }} 
            onSettingsClick={() => {
              setIsSettingsOpen(true);
              setIsMobileMenuOpen(false);
            }} 
          />
        </div>

        {/* Main content area: stable height on mobile so scroll container resolves */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-background h-full min-h-0 overflow-hidden md:min-h-0">
          
          {/* Single unified header: compact stats | search | date + filters */}
          <div className="shrink-0 z-[40] workbench-header bg-background border-b border-border/10 h-[72px] flex items-center">
            <JournalHeader 
              isMobileSearchOpen={isMobileSearchOpen}
              setIsMobileSearchOpen={setIsMobileSearchOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchInputRef={searchInputRef}
              focusSearch={focusSearch}
              dateRange={dateRange}
              setDateRange={setDateRange}
              resetFilters={resetFilters}
              filter={filter}
              setFilter={setFilter}
              selectedSetup={selectedSetup}
              setSelectedSetup={setSelectedSetup}
              selectedPair={selectedPair}
              setSelectedPair={setSelectedPair}
              selectedDirection={selectedDirection}
              setSelectedDirection={setSelectedDirection}
              selectedNewsDay={selectedNewsDay}
              setSelectedNewsDay={setSelectedNewsDay}
              selectedNewsEvent={selectedNewsEvent}
              setSelectedNewsEvent={setSelectedNewsEvent}
              activeTab={activeTab}
              onStatClick={handleStatClick}
              activeFilter={filter[0]}
            />
          </div>

          {/* Content */}
          <main id="main-content" role="region" aria-label="Main content" className="flex-1 relative overflow-hidden flex flex-col min-h-0 min-h-[calc(100dvh-72px)] md:min-h-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={transition}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <div className="flex-1 flex flex-col min-h-0 max-w-[1800px] mx-auto w-full">
                  {activeTab === 'journal' || activeTab === 'missed' ? (
                    <div className="flex-1 flex flex-col min-h-0 px-6 overflow-hidden">
                      <TradeList 
                        filter={activeTab === 'missed' ? ['Missed'] : filter}
                        setFilter={setFilter}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedSetup={selectedSetup}
                        setSelectedSetup={setSelectedSetup}
                      selectedPair={selectedPair}
                      setSelectedPair={setSelectedPair}
                      selectedDirection={selectedDirection}
                      setSelectedDirection={setSelectedDirection}
                      selectedNewsDay={selectedNewsDay}
                      setSelectedNewsDay={setSelectedNewsDay}
                      selectedNewsEvent={selectedNewsEvent}
                      setSelectedNewsEvent={setSelectedNewsEvent}
                      resetFilters={resetFilters}
                      mounted={mounted}
                      isMissedView={activeTab === 'missed'}
                    />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-8">
                      <GlobalErrorBoundary>
                        <AnalyticsView />
                      </GlobalErrorBoundary>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <SettingsSidebar 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddTradeModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setAddModalInitialData(null);
        }}
        initialData={addModalInitialData ?? undefined}
      />

      <motion.button 
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        onClick={() => setIsAddModalOpen(true)}
        title="Log trade (⌘N)"
        className="fixed z-50 w-14 h-14 rounded-full bg-primary-accent text-white shadow-md hover:shadow-lg ring-4 ring-primary-accent/20 flex items-center justify-center transition-shadow bottom-[max(2.5rem,env(safe-area-inset-bottom))] right-[max(2.5rem,env(safe-area-inset-right))]"
      >
        <Plus size={24} strokeWidth={2.5} className="text-white" />
      </motion.button>
    </div>
  );
}
