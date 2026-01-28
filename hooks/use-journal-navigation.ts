"use client";

import * as React from "react";
import { TabType } from "@/types";

export function useJournalNavigation() {
  const [activeTab, setActiveTabState] = React.useState<TabType>('journal');
  
  const setActiveTab = React.useCallback((tab: TabType) => {
    setActiveTabState(tab);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const setIsSidebarCollapsed = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("journal-sidebar-collapsed", next ? "true" : "false");
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("journal-sidebar-collapsed");
      if (stored === "true") setIsSidebarCollapsedState(true);
      else if (stored === "false") setIsSidebarCollapsedState(false);
    } catch {
      // ignore
    }
  }, []);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const openSettings = () => {
    setIsSettingsOpen(true);
    setIsMobileMenuOpen(false);
  };
  const closeSettings = () => setIsSettingsOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const focusSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  return {
    activeTab,
    setActiveTab,
    isSettingsOpen,
    setIsSettingsOpen,
    isAddModalOpen,
    setIsAddModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    mounted,
    searchInputRef,
    openAddModal,
    closeAddModal,
    toggleSidebar,
    openSettings,
    closeSettings,
    openMobileMenu,
    closeMobileMenu,
    focusSearch
  };
}
