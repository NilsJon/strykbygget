"use client";

import { Input } from "@/components/ui/input";
import type { Match } from "@/lib/types";

interface MatchEditorProps {
  matches: Match[];
  onChange: (matches: Match[]) => void;
}

export function MatchEditor({ matches, onChange }: MatchEditorProps) {
  const updateMatch = (id: string, field: "teamA" | "teamB", value: string) => {
    onChange(matches.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <div
          key={match.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
        >
          <span className="text-sm font-medium text-muted-foreground w-6">
            {index + 1}.
          </span>
          <Input
            value={match.teamA}
            onChange={(e) => updateMatch(match.id, "teamA", e.target.value)}
            placeholder="Hemmalag"
            className="flex-1 bg-input border-border"
          />
          <span className="text-muted-foreground font-medium">vs</span>
          <Input
            value={match.teamB}
            onChange={(e) => updateMatch(match.id, "teamB", e.target.value)}
            placeholder="Bortalag"
            className="flex-1 bg-input border-border"
          />
        </div>
      ))}
    </div>
  );
}
