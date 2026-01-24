"use client";

import { useMemo } from "react";
import { BudgetBar } from "@/components/budget-bar";
import { TicketForm } from "@/components/ticket-form";
import { SubmittedTickets } from "@/components/submitted-tickets";
import { FinalResult } from "@/components/final-result";
import { useBetting } from "@/lib/betting-context";
import type { Room, TicketSelection } from "@/lib/types";
import { getRemainingBudget } from "@/lib/types";
import { ArrowLeft, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomViewProps {
  room: Room;
  onBack: () => void;
}

export function RoomView({ room: initialRoom, onBack }: RoomViewProps) {
  const { rooms, submitTicket } = useBetting();
  
  // Get the live room data from context
  const room = rooms[initialRoom.id] || initialRoom;
  const remainingBudget = useMemo(() => getRemainingBudget(room), [room]);
  const totalSpent = room.totalBudget - remainingBudget;

  const handleSubmitTicket = (playerName: string, selections: TicketSelection[]) => {
    submitTicket(room.id, playerName, selections);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{room.tickets.length} tickets</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span>{"💰"}</span>
                <span className="font-semibold">{remainingBudget} kr left to deploy</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">{room.name}</h1>
            <p className="text-muted-foreground">
              {room.matches.length} matches &middot; {room.pricePerCombination} kr per combo
            </p>
          </div>

          <BudgetBar total={room.totalBudget} remaining={remainingBudget} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left column - Ticket form */}
          <div>
            {remainingBudget > 0 ? (
              <TicketForm
                room={room}
                remainingBudget={remainingBudget}
                onSubmit={handleSubmitTicket}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-card border border-accent/50 text-center">
                <div className="text-5xl mb-4">{"🎰💰🎰"}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{"All funds deployed! 🚀"}</h3>
                <p className="text-muted-foreground">
                  {"Your squad went all in! "}{room.totalBudget}{" kr of pure winning energy. Time to cash out (metaphorically, for now)."}
                </p>
              </div>
            )}
          </div>

          {/* Right column - Submitted tickets */}
          <div className="space-y-8">
            <SubmittedTickets tickets={room.tickets} />
          </div>
        </div>

        {/* Final result section */}
        {remainingBudget === 0 && room.tickets.length > 0 && (
          <div className="mt-12">
            <FinalResult room={room} />
          </div>
        )}
      </main>
    </div>
  );
}
