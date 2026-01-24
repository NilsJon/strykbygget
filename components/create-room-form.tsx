"use client";

import React, {useState} from "react"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MatchEditor} from "@/components/match-editor";
import type {Match, Room} from "@/lib/types";
import {ArrowRight, Check, Copy, Sparkles} from "lucide-react";

interface CreateRoomFormProps {
  onRoomCreated: (room: Room) => void;
}

export function CreateRoomForm({onRoomCreated}: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [targetCost, setTargetCost] = useState("")
  const [matches, setMatches] = useState<Match[]>(() => {
    // Initialize with 13 empty matches (standard Stryktipset)
    return Array.from({length: 13}, (_, i) => ({
      id: `match-${i + 1}`,
      teamA: "",
      teamB: "",
    }));
  });
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check that all matches are filled in
    const allMatchesFilled = matches.every(m => m.teamA.trim() && m.teamB.trim());
    const targetCostNumber = Number(targetCost);

    if (!roomName.trim()) {
      setError("Fyll i rumsnamn");
      return;
    }

    if (!targetCost || targetCostNumber <= 0) {
      setError("Fyll i en giltig målkostnad");
      return;
    }

    if (!allMatchesFilled) {
      setError("Fyll i alla matcher");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Convert UI format to Firestore format
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
              <Label className="text-foreground">Matcher (13 st)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Fyll i hemmalag och bortalag för alla matcher
              </p>
              <MatchEditor matches={matches} onChange={setMatches}/>
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
                    Skapa rum
                  </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
