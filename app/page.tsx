"use client";

import React from "react"

import { useState } from "react";
import { CreateRoomForm } from "@/components/create-room-form";
import { RoomView } from "@/components/room-view";
import type { Room } from "@/lib/types";
import { Coins, Users, Target, TrendingUp } from "lucide-react";

export default function Home() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  if (currentRoom) {
    return <RoomView room={currentRoom} onBack={() => setCurrentRoom(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span>{"💰"}</span>
            <span>Your path to riches starts here</span>
            <span>{"💰"}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {"💸"} Stryktipset Pool {"💸"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Pool your collective genius, combine your lucky numbers, and let the 
            <span className="text-accent font-semibold">{" money rain down "}</span> 
            on your squad. This is basically a money printer.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-2xl">
            <span>{"🍀"}</span>
            <span>{"🎰"}</span>
            <span>{"💎"}</span>
            <span>{"🏆"}</span>
            <span>{"💵"}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          {/* Create room form */}
          <CreateRoomForm onRoomCreated={setCurrentRoom} />

          {/* How it works sidebar */}
          <aside className="space-y-6 lg:pt-16">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-4">{"🚀"} How to get rich</h3>
              <div className="space-y-4">
                <Step
                  icon={<Target className="h-4 w-4" />}
                  title="Create a room"
                  description="Set your budget (investment opportunity)"
                />
                <Step
                  icon={<Users className="h-4 w-4" />}
                  title="Gather your crew"
                  description="More brains = more winning energy"
                />
                <Step
                  icon={<TrendingUp className="h-4 w-4" />}
                  title="Watch it grow"
                  description="Your future yacht awaits"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30">
              <p className="text-sm text-foreground font-medium">
                {"💡"} Pro tip: The more friends you invite, the more people to split the winnings with... wait.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-secondary/30 border border-border text-center">
              <p className="text-3xl mb-2">{"🤑"}</p>
              <p className="text-sm text-muted-foreground">
                No sign-up needed. Just vibes and dreams of financial freedom.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>{"💰"} Play responsibly. But also, imagine being a millionaire. {"💰"}</p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
