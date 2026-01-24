"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room, Outcome } from "@/lib/types";
import { Trophy, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinalResultProps {
  room: Room;
}

type CombinedTicket = {
  matchId: string;
  outcomes: Set<Outcome>;
}[];

export function FinalResult({ room }: FinalResultProps) {
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const combinedTicket = useMemo((): CombinedTicket => {
    const combined: Record<string, Set<Outcome>> = {};
    
    // Initialize with all matches
    room.matches.forEach(match => {
      combined[match.id] = new Set();
    });

    // Merge all selections from all tickets
    room.tickets.forEach(ticket => {
      ticket.selections.forEach(selection => {
        selection.outcomes.forEach(outcome => {
          combined[selection.matchId].add(outcome);
        });
      });
    });

    return room.matches.map(match => ({
      matchId: match.id,
      outcomes: combined[match.id],
    }));
  }, [room]);

  const totalCombinations = useMemo(() => {
    return combinedTicket.reduce((total, match) => {
      const count = match.outcomes.size;
      return total * (count > 0 ? count : 1);
    }, 1);
  }, [combinedTicket]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowResult(true);
    setIsGenerating(false);
  };

  if (!showResult) {
    return (
      <Card className="bg-card border-accent/30 shadow-lg shadow-accent/10">
        <CardHeader className="text-center">
          <div className="text-5xl mb-4">{"🎰✨🎰"}</div>
          <CardTitle className="text-2xl text-foreground">{"The moment of truth! 🥁"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {"All funds deployed. Time to see what your collective genius has created."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                {"Calculating your fortune..."}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                {"Reveal the golden ticket 🎫💰"}
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">{"(This is gonna be good)"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-accent/50 shadow-lg shadow-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              {"🏆💰"} The Golden Ticket {"💰🏆"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {"Your squad's masterpiece. Frame it. Treasure it. Cash it. 💎"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Results grid */}
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="grid grid-cols-[1fr,auto] bg-secondary/50">
            <div className="px-4 py-3 font-semibold text-foreground">Match</div>
            <div className="px-4 py-3 font-semibold text-foreground text-center w-36">Selection</div>
          </div>
          {room.matches.map((match, index) => {
            const selection = combinedTicket.find(s => s.matchId === match.id);
            const outcomes = selection ? Array.from(selection.outcomes).sort() : [];
            
            return (
              <div 
                key={match.id} 
                className={cn(
                  "grid grid-cols-[1fr,auto] border-t border-border",
                  index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                )}
              >
                <div className="px-4 py-3">
                  <span className="text-muted-foreground mr-2">{index + 1}.</span>
                  <span className="text-foreground">{match.teamA}</span>
                  <span className="text-muted-foreground mx-2">vs</span>
                  <span className="text-foreground">{match.teamB}</span>
                </div>
                <div className="px-4 py-3 flex items-center justify-center gap-2 w-36">
                  {(["1", "X", "2"] as Outcome[]).map((o) => (
                    <span
                      key={o}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                        outcomes.includes(o)
                          ? "bg-primary text-primary-foreground shadow-[0_0_8px_var(--glow)]"
                          : "bg-secondary/50 text-muted-foreground/30"
                      )}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">{"💰"} Invested</p>
            <p className="text-2xl font-bold text-primary">{room.totalBudget} kr</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">{"🎲"} Chances to win</p>
            <p className="text-2xl font-bold text-foreground">{totalCombinations}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">{"👥"} Future millionaires</p>
            <p className="text-2xl font-bold text-foreground">{room.tickets.length}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-border">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
            asChild
          >
            <a href="https://www.svenskaspel.se/stryktipset" target="_blank" rel="noopener noreferrer">
              {"🚀 Take my money, Svenska Spel! 💸"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            {"🍀 May the odds be ever in your favor 🍀"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
