"use client";

import { cn } from "@/lib/utils";
import type { Outcome } from "@/lib/types";

interface OutcomeSelectorProps {
  matchId: string;
  selected: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
  disabled?: boolean;
  distribution?: {
    one: string;
    x: string;
    two: string;
  };
}

const outcomes: Outcome[] = ["1", "X", "2"];

export function OutcomeSelector({ selected, onChange, disabled, distribution }: OutcomeSelectorProps) {
  const toggleOutcome = (outcome: Outcome) => {
    if (disabled) return;

    if (selected.includes(outcome)) {
      onChange(selected.filter(o => o !== outcome));
    } else {
      onChange([...selected, outcome]);
    }
  };

  const getDistribution = (outcome: Outcome): string | null => {
    if (!distribution) return null;
    if (outcome === "1") return distribution.one;
    if (outcome === "X") return distribution.x;
    if (outcome === "2") return distribution.two;
    return null;
  };

  return (
    <div className="flex gap-2">
      {outcomes.map((outcome) => {
        const isSelected = selected.includes(outcome);
        const dist = getDistribution(outcome);
        return (
          <div key={outcome} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => toggleOutcome(outcome)}
              disabled={disabled}
              className={cn(
                "w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200",
                "border-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_var(--glow)]"
                  : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {outcome}
            </button>
            {dist && (
              <span className="text-xs text-muted-foreground">
                {dist}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
