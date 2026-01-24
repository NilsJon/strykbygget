"use client";

import React, {useMemo, useState} from "react"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {OutcomeSelector} from "@/components/outcome-selector";
import type {Outcome, Room, TicketSelection} from "@/lib/types";
import {calculateCombinations, calculateCost} from "@/lib/types";
import {AlertCircle, CheckCircle2, Send, Sparkles} from "lucide-react";
import {cn, getClientId} from "@/lib/utils";

interface TicketFormProps {
  room: Room;
  onSubmit?: (playerName: string, selections: TicketSelection[]) => void;
}

export function TicketForm({room, onSubmit}: TicketFormProps) {
  // Check if user has already submitted
  const userTicket = room.tickets.find((ticket) => ticket.isYours);
  const hasSubmitted = !!userTicket;
  const [playerName, setPlayerName] = useState("");
  const [selections, setSelections] = useState<Record<string, Outcome[]>>(() => {
    const initial: Record<string, Outcome[]> = {};
    room.matches.forEach(match => {
      initial[match.id] = [];
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const cost = calculateCost(combinations);
  const costMatchesTarget = cost === room.targetCost;
  const isValid = playerName.trim() && combinations > 0 && costMatchesTarget;

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
    setError(null);
    setSuccess(false);

    try {
      // Convert UI format to Firestore format
      // selections is an array where each element is the outcomes for that match
      const firestoreSelections = room.matches.map((match) => {
        return selections[match.id] || [];
      });

      const response = await fetch(`/api/rooms/${room.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          selections: firestoreSelections,
          clientId: getClientId(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit ticket");
      }

      // Show success message
      setSuccess(true);

      // Reset form after a short delay
      setTimeout(() => {
        setPlayerName("");
        setSelections(() => {
          const initial: Record<string, Outcome[]> = {};
          room.matches.forEach((match) => {
            initial[match.id] = [];
          });
          return initial;
        });
        setSuccess(false);

        // Reload the page to get updated data
        window.location.reload();
      }, 1500);

      // Call legacy onSubmit callback if provided
      if (onSubmit) {
        onSubmit(playerName.trim(), ticketSelections);
      }
    } catch (err: any) {
      console.error("Error submitting ticket:", err);
      setError(err.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user has already submitted, show confirmation message
  if (hasSubmitted) {
    return (
      <Card className="bg-card border-primary/30 shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Kupong inskickad
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Du har redan skickat in din kupong till detta rum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ditt namn</span>
              <span className="font-semibold text-foreground">{userTicket!.playerName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Rader</span>
              <span className="font-semibold text-foreground">{userTicket!.combinations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kostnad</span>
              <span className="font-semibold text-primary">{userTicket!.cost} kr</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Du kan se din kupong i listan under "Inskickade kuponger" till höger.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            Din kupong
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Fyll i dina val för varje match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-foreground">Ditt namn</Label>
              <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ange ditt namn"
                  className="bg-input border-border"
                  required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-foreground">Dina val</Label>
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
                          {match.teamA} <span
                            className="text-muted-foreground">vs</span> {match.teamB}
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
                <span className="text-muted-foreground">Rader</span>
                <span className="font-semibold text-foreground">{combinations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Din kostnad</span>
                <span
                    className={cn(
                        "font-bold text-lg transition-colors",
                        combinations > 0 && !costMatchesTarget ? "text-destructive" : "text-primary"
                    )}
                >
                {cost} kr
              </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Målkostnad</span>
                <span className="font-semibold text-primary">
                {room.targetCost} kr
              </span>
              </div>
            </div>

            {combinations > 0 && !costMatchesTarget && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0"/>
                  <p className="text-sm">
                    Justera dina val. Kostnaden måste vara exakt {room.targetCost} kr
                    (nu {cost} kr).
                  </p>
                </div>
            )}

            {costMatchesTarget && combinations > 0 && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0"/>
                  <p className="text-sm">Perfekt! Din kupong matchar målkostnaden.</p>
                </div>
            )}

            {error && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0"/>
                  <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0"/>
                  <p className="text-sm">Kupong inskickad! Uppdaterar...</p>
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!isValid || isSubmitting || success}
            >
              {isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin"/>
                    Skickar in...
                  </>
              ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4"/>
                    Kupong inskickad!
                  </>
              ) : (
                  <>
                    <Send className="mr-2 h-4 w-4"/>
                    Skicka in kupong
                  </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
