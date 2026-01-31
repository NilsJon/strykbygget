"use client";

import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {Outcome, Room} from "@/lib/types";
import {AlertCircle, ExternalLink, Sparkles, Trophy} from "lucide-react";
import {cn} from "@/lib/utils";
import {calculateCombinationsFromArray, generateFinalTicket} from "@/lib/tipsLogic";

interface FinalResultProps {
  room: Room;
}

export function FinalResult({room}: FinalResultProps) {
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate distribution from submitted tickets
  const ticketDistribution = useMemo(() => {
    const distributions = new Map<string, { one: number; x: number; two: number }>();

    room.matches.forEach((match) => {
      distributions.set(match.id, {one: 0, x: 0, two: 0});
    });

    // Count votes for each outcome
    room.tickets.forEach((ticket) => {
      ticket.selections.forEach((selection) => {
        const dist = distributions.get(selection.matchId);
        if (dist) {
          selection.outcomes.forEach((outcome) => {
            if (outcome === "1") dist.one++;
            else if (outcome === "X") dist.x++;
            else if (outcome === "2") dist.two++;
          });
        }
      });
    });

    // Convert counts to percentages
    const percentageDistributions = new Map<string, { one: string; x: string; two: string }>();
    const totalTickets = room.tickets.length;

    distributions.forEach((counts, matchId) => {
      const onePercent = totalTickets > 0 ? Math.round((counts.one / totalTickets) * 100) : 0;
      const xPercent = totalTickets > 0 ? Math.round((counts.x / totalTickets) * 100) : 0;
      const twoPercent = totalTickets > 0 ? Math.round((counts.two / totalTickets) * 100) : 0;

      percentageDistributions.set(matchId, {
        one: onePercent.toString(),
        x: xPercent.toString(),
        two: twoPercent.toString(),
      });
    });

    return percentageDistributions;
  }, [room.matches, room.tickets]);

  const finalTicketData = useMemo(() => {
    const ticket = generateFinalTicket(room.matches, room.tickets, room.targetCost);

    if (!ticket) {
      return null;
    }

    const combinations = calculateCombinationsFromArray(
        ticket.map((s) => s.outcomes)
    );


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
              <AlertCircle className="h-6 w-6 text-destructive"/>
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
                    <Sparkles className="mr-2 h-5 w-5 animate-spin"/>
                    Skapar sammanställning...
                  </>
              ) : (
                  <>
                    <Trophy className="mr-2 h-5 w-5"/>
                    Visa sammanlagt system
                  </>
              )}
            </Button>
          </CardContent>
        </Card>
    );
  }

  const {selections, combinations, isValid} = finalTicketData;

  return (
      <Card className="bg-card border-accent/50 shadow-lg shadow-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                Sammanlagt system
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Vi väljer majoriteten per match och garderar de mest osäkra matcherna tills vi når
                målkostnaden.
              </CardDescription>
              <CardDescription className="text-muted-foreground mt-2 text-xs">
                📊 Procentsatserna visar hur många deltagare i gruppen som röstat på varje tecken (1,
                X eller 2).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation warning */}
          {!isValid && (
              <div
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5"/>
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
              <div className="px-4 py-3 font-semibold text-foreground">Resultat</div>
            </div>
            {room.matches.map((match, index) => {
              const selection = selections.find((s) => s.matchId === match.id);
              const outcomes = selection ? selection.outcomes : [];
              const dist = ticketDistribution.get(match.id);

              const getDistributionValue = (outcome: Outcome): string | null => {
                if (!dist) return null;
                if (outcome === "1") return dist.one;
                if (outcome === "X") return dist.x;
                if (outcome === "2") return dist.two;
                return null;
              };

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
                    <div className="px-4 py-3 flex items-center justify-center gap-2 w-44">
                      {(["1", "X", "2"] as Outcome[]).map((o) => {
                        const distValue = getDistributionValue(o);
                        return (
                            <div key={o} className="flex flex-col items-center gap-1">
                        <span
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                                outcomes.includes(o)
                                    ? "bg-primary text-primary-foreground shadow-[0_0_8px_var(--glow)]"
                                    : "bg-secondary/50 text-muted-foreground/30"
                            )}
                        >
                          {o}
                        </span>
                              {distValue && (
                                  <span className="text-xs text-muted-foreground">
                            {distValue}%
                          </span>
                              )}
                            </div>
                        );
                      })}
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
              <a href="https://www.svenskaspel.se/stryktipset" target="_blank"
                 rel="noopener noreferrer">
                Spela på Svenska Spel
                <ExternalLink className="ml-2 h-4 w-4"/>
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
