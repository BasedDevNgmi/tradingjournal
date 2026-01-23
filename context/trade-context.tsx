"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade } from '@/types';
import { MOCK_TRADES } from '@/lib/mock-data';

interface TradesContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load trades from localStorage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('trading-journal-trades');
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error("Failed to parse saved trades", e);
        setTrades(MOCK_TRADES);
      }
    } else {
      setTrades(MOCK_TRADES);
    }
    setIsInitialized(true);
  }, []);

  // Save trades to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('trading-journal-trades', JSON.stringify(trades));
    }
  }, [trades, isInitialized]);

  const addTrade = (trade: Trade) => {
    setTrades((prev) => [trade, ...prev]);
  };

  return (
    <TradesContext.Provider value={{ trades, addTrade }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
}
