"use client";

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Trade } from '@/types';
import { MOCK_TRADES } from '@/lib/mock-data';

interface TradesDataContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updatedData: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  importTrades: (trades: Trade[]) => void;
}

interface TradesUIContextType {
  isGhostMode: boolean;
  toggleGhostMode: () => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
}

const TradesDataContext = createContext<TradesDataContextType | undefined>(undefined);
const TradesUIContext = createContext<TradesUIContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isGhostMode, setIsGhostMode] = React.useState(false);
  const [timeFilter, setTimeFilter] = React.useState('ALL');

  // Load ghost mode from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedGhostMode = localStorage.getItem('trading-journal-ghost-mode');
        if (savedGhostMode) {
          setIsGhostMode(savedGhostMode === 'true');
        }
      } catch (e) {
        console.error("Failed to load ghost mode", e);
      }
    }
  }, []);

  const toggleGhostMode = React.useCallback(() => {
    setIsGhostMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('trading-journal-ghost-mode', String(next));
        } catch (e) {
          console.error("Failed to save ghost mode", e);
        }
      }
      return next;
    });
  }, []);

  // Load trades from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTrades = localStorage.getItem('trading-journal-trades');
        if (savedTrades) {
          setTrades(JSON.parse(savedTrades));
        } else {
          setTrades(MOCK_TRADES);
        }
      } catch (e) {
        console.error("Failed to parse saved trades", e);
        setTrades(MOCK_TRADES);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save trades to localStorage with debouncing
  React.useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const handler = setTimeout(() => {
      try {
        localStorage.setItem('trading-journal-trades', JSON.stringify(trades));
      } catch (e) {
        console.error("Failed to save trades to localStorage", e);
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          console.warn("LocalStorage quota exceeded. Consider clearing old trades.");
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [trades, isInitialized]);

  const addTrade = React.useCallback((trade: Trade) => {
    setTrades((prev) => [trade, ...prev]);
  }, []);

  const updateTrade = React.useCallback((id: string, updatedData: Partial<Trade>) => {
    setTrades((prev) => 
      prev.map((trade) => (trade.id === id ? { ...trade, ...updatedData } : trade))
    );
  }, []);

  const deleteTrade = React.useCallback((id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
  }, []);

  const importTrades = React.useCallback((newTrades: Trade[]) => {
    setTrades(newTrades);
  }, []);

  const dataValue = React.useMemo(() => ({ 
    trades, 
    addTrade, 
    updateTrade, 
    deleteTrade, 
    importTrades,
  }), [trades, addTrade, updateTrade, deleteTrade, importTrades]);

  const uiValue = React.useMemo(() => ({ 
    isGhostMode, 
    toggleGhostMode, 
    timeFilter, 
    setTimeFilter,
  }), [isGhostMode, toggleGhostMode, timeFilter, setTimeFilter]);

  return (
    <TradesDataContext.Provider value={dataValue}>
      <TradesUIContext.Provider value={uiValue}>
        {children}
      </TradesUIContext.Provider>
    </TradesDataContext.Provider>
  );
}

export function useTradesData() {
  const context = useContext(TradesDataContext);
  if (context === undefined) {
    throw new Error('useTradesData must be used within a TradesProvider');
  }
  return context;
}

export function useTradesUI() {
  const context = useContext(TradesUIContext);
  if (context === undefined) {
    throw new Error('useTradesUI must be used within a TradesProvider');
  }
  return context;
}

/** Combined hook for components that need both data and UI. */
export function useTrades() {
  const data = useTradesData();
  const ui = useTradesUI();
  return { ...data, ...ui };
}
