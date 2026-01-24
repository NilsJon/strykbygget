"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Ticket, Outcome, Room } from "@/lib/types";
import { User, Coins, Eye, CheckSquare, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmittedTicketsProps {
  tickets: Ticket[];
  matches: Room["matches"];
}

export function SubmittedTickets({ tickets, matches }: SubmittedTicketsProps) {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [showResultsForm, setShowResultsForm] = useState(false);
  const [results, setResults] = useState<Outcome[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleOpenResultsForm = () => {
    setResults(new Array(matches.length).fill(""));
    setShowResultsForm(true);
    setShowLeaderboard(false);
  };

  const handleResultChange = (index: number, outcome: Outcome) => {
    const newResults = [...results];
    newResults[index] = outcome;
    setResults(newResults);
  };

  const handleSubmitResults = () => {
    // Check all results are filled
    if (results.some((r) => !r)) {
      alert("Fyll i alla matchresultat");
      return;
    }
    setShowResultsForm(false);
    setShowLeaderboard(true);
  };

  const calculateScore = (ticket: Ticket): number => {
    let score = 0;
    ticket.selections.forEach((selection, index) => {
      const actualResult = results[index];
      if (selection.outcomes.includes(actualResult)) {
        score++;
      }
    });
    return score;
  };

  const leaderboard = showLeaderboard
    ? [...tickets]
        .map((ticket) => ({
          ticket,
          score: calculateScore(ticket),
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  if (tickets.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Inskickade kuponger</CardTitle>
          <CardDescription className="text-muted-foreground">
            Inga kuponger ännu. Bli den första att skicka in!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">Väntar på kuponger...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Inskickade kuponger</CardTitle>
        <CardDescription className="text-muted-foreground">
          {tickets.length} {tickets.length === 1 ? "kupong" : "kuponger"} inlämnade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                ticket.isYours
                  ? "bg-primary/10 border-primary/30 hover:border-primary/50"
                  : "bg-secondary/30 border-border hover:border-primary/30"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeIn 0.3s ease-out forwards"
              }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  ticket.isYours ? "bg-primary/30" : "bg-primary/20"
                )}>
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {ticket.playerName}
                    {ticket.isYours && (
                      <span className="ml-2 text-xs text-primary font-semibold">(Du)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.combinations} rader
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                  <Coins className="h-3 w-3 mr-1" />
                  {ticket.cost} kr
                </Badge>
                {ticket.isYours && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingTicket(ticket)}
                    className="h-8 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visa
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ticket viewer dialog */}
        <Dialog open={!!viewingTicket} onOpenChange={() => setViewingTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle>Din kupong</DialogTitle>
              <DialogDescription>
                Se dina val för varje match
              </DialogDescription>
            </DialogHeader>
            {viewingTicket && (
              <div className="space-y-4 px-6 pb-6 overflow-y-auto">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Namn</p>
                    <p className="font-semibold text-foreground">{viewingTicket.playerName}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Rader</p>
                    <p className="font-semibold text-foreground">{viewingTicket.combinations}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Kostnad</p>
                    <p className="font-semibold text-primary">{viewingTicket.cost} kr</p>
                  </div>
                </div>

                {/* Matches */}
                <div className="rounded-xl overflow-hidden border border-border">
                  <div className="grid grid-cols-[1fr,auto] bg-secondary/50">
                    <div className="px-4 py-3 font-semibold text-foreground">Val</div>
                  </div>
                  {matches.map((match, index) => {
                    const selection = viewingTicket.selections[index];
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
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rätta kupong button */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleOpenResultsForm}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            variant="default"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Rätta kupong
          </Button>
        </div>

        {/* Results entry dialog */}
        <Dialog open={showResultsForm} onOpenChange={setShowResultsForm}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle>Ange matchresultat</DialogTitle>
              <DialogDescription>
                Fyll i det faktiska resultatet för varje match
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 overflow-y-auto space-y-3">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {match.teamA} <span className="text-muted-foreground">vs</span>{" "}
                        {match.teamB}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["1", "X", "2"] as Outcome[]).map((outcome) => (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => handleResultChange(index, outcome)}
                        className={cn(
                          "w-10 h-10 rounded-lg font-bold text-sm transition-all",
                          results[index] === outcome
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {outcome}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button
                  onClick={handleSubmitResults}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={results.some((r) => !r)}
                >
                  Visa resultattabell
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Leaderboard dialog */}
        <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Resultattabell
              </DialogTitle>
              <DialogDescription>
                Antal rätt per deltagare (av {matches.length} matcher)
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 overflow-y-auto space-y-3">
              {leaderboard.map((entry, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div
                    key={entry.ticket.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      isFirst && "bg-yellow-500/10 border-yellow-500/30 shadow-lg",
                      isSecond && "bg-gray-400/10 border-gray-400/30",
                      isThird && "bg-orange-600/10 border-orange-600/30",
                      !isFirst && !isSecond && !isThird && "bg-secondary/30 border-border"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center">
                        {isFirst && <Medal className="h-6 w-6 text-yellow-500 inline" />}
                        {isSecond && <Medal className="h-6 w-6 text-gray-400 inline" />}
                        {isThird && <Medal className="h-6 w-6 text-orange-600 inline" />}
                        {!isFirst && !isSecond && !isThird && (
                          <span className="text-lg font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {entry.ticket.playerName}
                          {entry.ticket.isYours && (
                            <span className="ml-2 text-xs text-primary font-semibold">
                              (Du)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.ticket.combinations} rader · {entry.ticket.cost} kr
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted-foreground">rätt</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
