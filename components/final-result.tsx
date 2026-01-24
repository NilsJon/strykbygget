"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room, Outcome, TicketSelection } from "@/lib/types";
import { Trophy, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateFinalTicket } from "@/lib/tipsLogic";
import { calculateCombinationsFromArray } from "@/lib/tipsLogic";

interface FinalResultProps {
  room: Room;
}

export function FinalResult({ room }: FinalResultProps) {
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const finalTicketData = useMemo(() => {
    const ticket = generateFinalTicket(room.matches, room.tickets, room.targetCost);

    if (!ticket) {
      return null;
    }

    const combinations = calculateCombinationsFromArray(
      ticket.map((s) => s.outcomes)
    );

    // Debug log to verify cost
    if (typeof window !== "undefined") {
      console.log("[Final Ticket Debug]", {
        targetCost: room.targetCost,
        actualCost: combinations,
        matches: ticket.map((s) => ({
          matchId: s.matchId,
          picks: s.outcomes.length,
          outcomes: s.outcomes,
        })),
      });
    }

    return {
      selections: ticket,
      combinations,
      isValid: combinations === room.targetCost,
    };
  }, [room]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowResult(true);
    setIsGenerating(false);
  };

  if (!finalTicketData) {
    return (
      <Card className="bg-card border-destructive/30 shadow-lg shadow-destructive/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Kunde inte generera slutgiltig kupong
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Målkostnaden ({room.targetCost} kr) kan inte uttryckas som 2^a × 3^b.
            Välj en annan målkostnad (t.ex. 1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24...).
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!showResult) {
    return (
      <Card className="bg-card border-accent/30 shadow-lg shadow-accent/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Sammanställning</CardTitle>
          <CardDescription className="text-muted-foreground">
            Se det kombinerade systemet från alla kuponger
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
                Skapar sammanställning...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                Visa sammanlagt system
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { selections, combinations, isValid } = finalTicketData;

  return (
    <Card className="bg-card border-accent/50 shadow-lg shadow-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              Sammanlagt system
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Vi väljer majoriteten per match och garderar de mest osäkra matcherna tills vi når målkostnaden.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation warning */}
        {!isValid && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Varning: Kostnad matchar inte målet</p>
            </div>
            <p className="text-sm mt-1">
              Beräknad kostnad: {combinations} kr (mål: {room.targetCost} kr)
            </p>
          </div>
        )}

        {/* Results grid */}
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="grid grid-cols-[1fr,auto] bg-secondary/50">
            <div className="px-4 py-3 font-semibold text-foreground">Match</div>
            <div className="px-4 py-3 font-semibold text-foreground text-center w-36">Val</div>
          </div>
          {room.matches.map((match, index) => {
            const selection = selections.find((s) => s.matchId === match.id);
            const outcomes = selection ? selection.outcomes : [];

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
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">Kostnad (rader)</p>
            <p className={cn(
              "text-2xl font-bold",
              isValid ? "text-foreground" : "text-destructive"
            )}>
              {combinations} kr
            </p>
            {isValid && (
              <p className="text-xs text-muted-foreground mt-1">✓ Exakt målkostnad</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">Deltagare</p>
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
              Spela på Svenska Spel
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Lycka till!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
