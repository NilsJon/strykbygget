"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BudgetBarProps {
  total: number;
  remaining: number;
  className?: string;
}

export function BudgetBar({ total, remaining, className }: BudgetBarProps) {
  const [animatedRemaining, setAnimatedRemaining] = useState(remaining);
  const percentage = (animatedRemaining / total) * 100;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRemaining(remaining);
    }, 50);
    return () => clearTimeout(timer);
  }, [remaining]);

  const getMessage = () => {
    if (remaining === 0) return "FULLY LOADED! 🚀";
    if (remaining < total * 0.2) return "Almost there! 🔥";
    if (remaining < total * 0.5) return "Halfway to glory! 💪";
    return "War chest growing! 💰";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{getMessage()}</span>
        <span 
          className={cn(
            "font-semibold transition-colors duration-300",
            remaining === 0 ? "text-accent" : remaining < total * 0.2 ? "text-warning" : "text-primary"
          )}
        >
          {remaining} kr / {total} kr
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            remaining === 0 
              ? "bg-accent shadow-[0_0_10px_var(--accent)]" 
              : remaining < total * 0.2 
                ? "bg-warning" 
                : "bg-primary shadow-[0_0_10px_var(--primary)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
