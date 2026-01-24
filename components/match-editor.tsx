"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { Match } from "@/lib/types";
import { generateId } from "@/lib/types";

interface MatchEditorProps {
  matches: Match[];
  onChange: (matches: Match[]) => void;
}

export function MatchEditor({ matches, onChange }: MatchEditorProps) {
  const [newTeamA, setNewTeamA] = useState("");
  const [newTeamB, setNewTeamB] = useState("");

  const addMatch = () => {
    if (!newTeamA.trim() || !newTeamB.trim()) return;
    
    const newMatch: Match = {
      id: generateId(),
      teamA: newTeamA.trim(),
      teamB: newTeamB.trim(),
    };
    
    onChange([...matches, newMatch]);
    setNewTeamA("");
    setNewTeamB("");
  };

  const removeMatch = (id: string) => {
    onChange(matches.filter(m => m.id !== id));
  };

  const updateMatch = (id: string, field: "teamA" | "teamB", value: string) => {
    onChange(matches.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="space-y-4">
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
              placeholder="Team A"
              className="flex-1 bg-input border-border"
            />
            <span className="text-muted-foreground font-medium">vs</span>
            <Input
              value={match.teamB}
              onChange={(e) => updateMatch(match.id, "teamB", e.target.value)}
              placeholder="Team B"
              className="flex-1 bg-input border-border"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeMatch(match.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border">
        <span className="text-sm font-medium text-muted-foreground w-6">
          {matches.length + 1}.
        </span>
        <Input
          value={newTeamA}
          onChange={(e) => setNewTeamA(e.target.value)}
          placeholder="Team A"
          className="flex-1 bg-input border-border"
          onKeyDown={(e) => e.key === "Enter" && addMatch()}
        />
        <span className="text-muted-foreground font-medium">vs</span>
        <Input
          value={newTeamB}
          onChange={(e) => setNewTeamB(e.target.value)}
          placeholder="Team B"
          className="flex-1 bg-input border-border"
          onKeyDown={(e) => e.key === "Enter" && addMatch()}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={addMatch}
          className="text-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
