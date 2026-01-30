"use client";

import {TicketForm} from "@/components/ticket-form";
import {SubmittedTickets} from "@/components/submitted-tickets";
import {FinalResult} from "@/components/final-result";
import type {Room} from "@/lib/types";
import {ArrowLeft, Target, Users} from "lucide-react";
import {Button} from "@/components/ui/button";

interface RoomViewProps {
  room: Room;
  onBack: () => void;
  drawState?: string;
}

export function RoomView({room, onBack, drawState = "Open"}: RoomViewProps) {

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header
            className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2"/>
                Tillbaka
              </Button>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4"/>
                  <span>{room.tickets.length} kuponger</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-4 w-4"/>
                  <span className="font-semibold">Mål: {room.targetCost} kr</span>
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <h1 className="text-2xl font-bold text-foreground break-words">{room.name}</h1>
              <p className="text-muted-foreground">
                {room.matches.length} matcher &middot; Alla kuponger måste kosta
                exakt {room.targetCost} kr
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left column - Ticket form */}
            <div>
              <TicketForm room={room} drawState={drawState}/>
            </div>

            {/* Right column - Submitted tickets */}
            <div className="space-y-8">
              <SubmittedTickets tickets={room.tickets} matches={room.matches}/>
            </div>
          </div>

          {/* Final result section */}
          {room.tickets.length > 0 && (
              <div className="mt-12">
                <FinalResult room={room}/>
              </div>
          )}
        </main>
      </div>
  );
}
