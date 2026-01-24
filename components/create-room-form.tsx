"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchEditor } from "@/components/match-editor";
import { useBetting } from "@/lib/betting-context";
import type { Match, Room } from "@/lib/types";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";

interface CreateRoomFormProps {
  onRoomCreated: (room: Room) => void;
}

export function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
  const { createRoom } = useBetting();
  const [roomName, setRoomName] = useState("");
  const [totalBudget, setTotalBudget] = useState(100);
  const [pricePerCombination, setPricePerCombination] = useState(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim() || matches.length === 0) return;

    const room = createRoom(
      roomName.trim(),
      totalBudget,
      pricePerCombination,
      matches
    );

    setCreatedRoom(room);
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
          <div className="text-5xl mb-4">{"💰🎉💰"}</div>
          <CardTitle className="text-2xl text-foreground">{"Ka-ching! Room Created!"}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Quick, share this money-making machine with your crew {"🤑"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Room name</p>
            <p className="font-semibold text-foreground">{createdRoom.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Budget</p>
              <p className="font-semibold text-primary text-lg">{createdRoom.totalBudget} kr</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Matches</p>
              <p className="font-semibold text-foreground text-lg">{createdRoom.matches.length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Shareable link</Label>
            <div className="flex gap-2">
              <Input
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/room/${createdRoom.id}`}
                readOnly
                className="bg-input border-border font-mono text-sm"
              />
              <Button onClick={copyLink} variant="secondary" className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => onRoomCreated(createdRoom)} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Go to room
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground flex items-center gap-2">
          {"💼"} Start your investment fund
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {"AKA a betting room. But \"investment fund\" sounds fancier."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-foreground">Room name</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Friday Night Tipset"
              className="bg-input border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-foreground">Total budget (kr)</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Price per combo (kr)</Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={pricePerCombination}
                onChange={(e) => setPricePerCombination(Number(e.target.value))}
                className="bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Matches</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Add the matches for this betting round
            </p>
            <MatchEditor matches={matches} onChange={setMatches} />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!roomName.trim() || matches.length === 0}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {"Launch the money machine 🚀"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
