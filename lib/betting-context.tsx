"use client";

import { createContext, useContext, type ReactNode } from "react";

// Legacy betting context - kept for compatibility but no longer used
// All data operations now go through API routes

interface BettingContextType {
  // Empty for now - kept to avoid breaking existing code
}

const BettingContext = createContext<BettingContextType | null>(null);

export function BettingProvider({ children }: { children: ReactNode }) {
  return (
    <BettingContext.Provider value={{}}>
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error("useBetting must be used within a BettingProvider");
  }
  return context;
}
