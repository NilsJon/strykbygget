"use client";

import React from "react"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeSelector } from "@/components/outcome-selector";
import type { Room, TicketSelection, Outcome } from "@/lib/types";
import { calculateCombinations, calculateCost } from "@/lib/types";
import { Send, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketFormProps {
  room: Room;
  remainingBudget: number;
  onSubmit: (playerName: string, selections: TicketSelection[]) => void;
}

export function TicketForm({ room, remainingBudget, onSubmit }: TicketFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [selections, setSelections] = useState<Record<string, Outcome[]>>(() => {
    const initial: Record<string, Outcome[]> = {};
    room.matches.forEach(match => {
      initial[match.id] = [];
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketSelections: TicketSelection[] = useMemo(() => {
    return room.matches.map(match => ({
      matchId: match.id,
      outcomes: selections[match.id] || [],
    }));
  }, [room.matches, selections]);

  const combinations = useMemo(() => {
    const allHaveSelections = room.matches.every(m => (selections[m.id]?.length || 0) > 0);
    if (!allHaveSelections) return 0;
    return calculateCombinations(ticketSelections);
  }, [ticketSelections, room.matches, selections]);

  const cost = calculateCost(combinations, room.pricePerCombination);
  const isOverBudget = cost > remainingBudget;
  const isValid = playerName.trim() && combinations > 0 && !isOverBudget;

  const handleOutcomeChange = (matchId: string, outcomes: Outcome[]) => {
    setSelections(prev => ({
      ...prev,
      [matchId]: outcomes,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(playerName.trim(), ticketSelections);
    
    // Reset form
    setPlayerName("");
    setSelections(() => {
      const initial: Record<string, Outcome[]> = {};
      room.matches.forEach(match => {
        initial[match.id] = [];
      });
      return initial;
    });
    setIsSubmitting(false);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          {"🎫"} Your Winning Ticket
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {"Trust your gut. It knows things. 🔮"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-foreground">Your name</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-foreground">Your predictions</Label>
            {room.matches.map((match, index) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {match.teamA} <span className="text-muted-foreground">vs</span> {match.teamB}
                    </p>
                  </div>
                </div>
                <OutcomeSelector
                  matchId={match.id}
                  selected={selections[match.id] || []}
                  onChange={(outcomes) => handleOutcomeChange(match.id, outcomes)}
                />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combinations</span>
              <span className="font-semibold text-foreground">{combinations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket cost</span>
              <span 
                className={cn(
                  "font-bold text-lg transition-colors",
                  isOverBudget ? "text-destructive" : "text-primary"
                )}
              >
                {cost} kr
              </span>
            </div>
          </div>

          {isOverBudget && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{"Whoa there, Bezos! 💸 This ticket costs more than we've got."}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                {"Locking in your destiny..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {"Lock in these winners 🔒💰"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
