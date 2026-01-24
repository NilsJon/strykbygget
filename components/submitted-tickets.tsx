"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/lib/types";
import { User, Coins } from "lucide-react";

interface SubmittedTicketsProps {
  tickets: Ticket[];
}

export function SubmittedTickets({ tickets }: SubmittedTicketsProps) {
  if (tickets.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">{"💸"} Money Makers</CardTitle>
          <CardDescription className="text-muted-foreground">
            {"No tickets yet. Someone's gotta be first to claim their fortune! 🎯"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3">{"🦗"}</div>
            <p className="text-sm">{"*cricket sounds* Be a hero. Submit a ticket."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">{"🤑"} The Investors</CardTitle>
        <CardDescription className="text-muted-foreground">
          {tickets.length} {tickets.length === 1 ? "genius has" : "geniuses have"} {"locked in their winning picks 🔮"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border transition-all hover:border-primary/30"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: "fadeIn 0.3s ease-out forwards"
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{ticket.playerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.combinations} combinations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                  <Coins className="h-3 w-3 mr-1" />
                  {ticket.cost} kr
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
