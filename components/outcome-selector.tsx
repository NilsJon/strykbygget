"use client";

import { cn } from "@/lib/utils";
import type { Outcome } from "@/lib/types";

interface OutcomeSelectorProps {
  matchId: string;
  selected: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
  disabled?: boolean;
}

const outcomes: Outcome[] = ["1", "X", "2"];

export function OutcomeSelector({ selected, onChange, disabled }: OutcomeSelectorProps) {
  const toggleOutcome = (outcome: Outcome) => {
    if (disabled) return;
    
    if (selected.includes(outcome)) {
      onChange(selected.filter(o => o !== outcome));
    } else {
      onChange([...selected, outcome]);
    }
  };

  return (
    <div className="flex gap-2">
      {outcomes.map((outcome) => {
        const isSelected = selected.includes(outcome);
        return (
          <button
            key={outcome}
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
        );
      })}
    </div>
  );
}
