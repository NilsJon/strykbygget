"use client";

import React, {useState, useEffect} from "react"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {Match, Room} from "@/lib/types";
import {ArrowRight, Check, Copy, Sparkles, Loader2} from "lucide-react";
import {fetchCurrentStryktipsetDraw} from "@/lib/stryktipset-api";

interface CreateRoomFormProps {
  onRoomCreated: (room: Room) => void;
}

export function CreateRoomForm({onRoomCreated}: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [targetCost, setTargetCost] = useState("")
  const [matches, setMatches] = useState<Match[]>([]);
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [drawNumber, setDrawNumber] = useState<number>(0);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches from API on mount
  useEffect(() => {
    const loadMatches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const draw = await fetchCurrentStryktipsetDraw();

        if (!draw) {
          setError("Kunde inte hämta matcher från Stryktipset. Försök igen senare.");
          return;
        }

        if (draw.matches.length !== 13) {
          setError(`Fel antal matcher (${draw.matches.length}). Stryktipset ska ha 13 matcher.`);
          return;
        }

        // Convert API format to Match format
        const loadedMatches: Match[] = draw.matches.map((match) => ({
          id: `match-${match.eventNumber}`,
          teamA: match.home,
          teamB: match.away,
          distribution: match.distribution,
        }));

        setMatches(loadedMatches);
        setWeekNumber(draw.weekNumber);
        setDrawNumber(draw.drawNumber);
      } catch (err: any) {
        console.error("Error loading matches:", err);
        setError("Kunde inte hämta matcher från Stryktipset. Försök igen senare.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetCostNumber = Number(targetCost);

    if (!roomName.trim()) {
      setError("Fyll i rumsnamn");
      return;
    }

    if (!targetCost || targetCostNumber <= 0) {
      setError("Fyll i en giltig målkostnad");
      return;
    }

    if (matches.length !== 13) {
      setError("Matcher är inte laddade. Försök igen.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Convert UI format to Firestore format
      // Note: We intentionally do NOT store distribution as it changes throughout the week
      const firestoreMatches = matches.map((match) => ({
        home: match.teamA.trim(),
        away: match.teamB.trim(),
      }));

      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: roomName.trim(),
          targetCost: targetCostNumber,
          matches: firestoreMatches,
          drawNumber,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create room");
      }

      const data = await response.json();

      // Convert back to UI format
      const room: Room = {
        id: data.id,
        name: data.title,
        targetCost: data.targetCost,
        matches,
        tickets: [],
        createdAt: new Date(data.createdAt),
        drawNumber,
      };

      setCreatedRoom(room);
    } catch (err: any) {
      console.error("Error creating room:", err);
      setError(err.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/room/${createdRoom?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdRoom) {
    return (
        <Card className="bg-card border-border shadow-lg shadow-glow/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Rummet är skapat</CardTitle>
            <CardDescription className="text-muted-foreground">
              Dela länken med era spelkompisar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Rumsnamn</p>
              <p className="font-semibold text-foreground break-words">{createdRoom.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Målkostnad</p>
                <p className="font-semibold text-primary text-lg">{createdRoom.targetCost} kr</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Matcher</p>
                <p className="font-semibold text-foreground text-lg">{createdRoom.matches.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Länk till rummet</Label>
              <div className="flex gap-2">
                <Input
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/room/${createdRoom.id}`}
                    readOnly
                    className="bg-input border-border font-mono text-sm"
                />
                <Button onClick={copyLink} variant="secondary" className="shrink-0">
                  {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                </Button>
              </div>
            </div>

            <Button
                onClick={() => onRoomCreated(createdRoom)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Gå till rummet
              <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </CardContent>
        </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-2">
            Skapa rum
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sätt upp ett nytt spelrum för er grupp
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Hämtar matcher från Stryktipset...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && matches.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-2">
            Skapa rum
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sätt upp ett nytt spelrum för er grupp
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center max-w-md">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-2">
            Skapa rum
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sätt upp ett nytt spelrum för er grupp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-foreground">Rumsnamn</Label>
              <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Fredagstipset"
                  className="bg-input border-border"
                  required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCost" className="text-foreground">
                Målkostnad (kr)
              </Label>
              <Input
                id="targetCost"
                type="number"
                min={1}
                value={targetCost}
                placeholder="t.ex. 8"
                onChange={(e) => setTargetCost(e.target.value)}
                className="bg-input border-border"
                required
              />
              <p className="text-sm text-muted-foreground">
                Alla kuponger måste kosta exakt detta belopp. Kostnad = antal rader.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Matcher från Stryktipset vecka {weekNumber}</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Matcherna hämtas automatiskt från Svenska Spel
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {matches.map((match, index) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-sm text-foreground">
                      {match.teamA}
                    </span>
                    <span className="text-muted-foreground text-sm">vs</span>
                    <span className="flex-1 text-sm text-foreground text-right">
                      {match.teamB}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
                <div
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isCreating}
            >
              {isCreating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin"/>
                    Skapar rum...
                  </>
              ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Skapa rum för Stryktipset vecka {weekNumber}
                  </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
