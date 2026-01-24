"use client";

import React from "react"

import {useRouter} from "next/navigation";
import {CreateRoomForm} from "@/components/create-room-form";
import type {Room} from "@/lib/types";
import {Target, TrendingUp, Users} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleRoomCreated = (room: Room) => {
    // Navigate to the room page
    router.push(`/room/${room.id}`);
  };

  return (
      <div className="min-h-screen bg-background">
        {/* Hero section */}
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              💸Strykbygget💸
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
              Spela Stryktipset tillsammans med kompisar. Samla era val och skapa gemensamma system.
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
            {/* Create room form */}
            <CreateRoomForm onRoomCreated={handleRoomCreated}/>

            {/* How it works sidebar */}
            <aside className="space-y-6 lg:pt-16">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">Så funkar det</h3>
                <div className="space-y-4">
                  <Step
                      icon={<Target className="h-4 w-4"/>}
                      title="Skapa ett rum"
                      description="Bestäm målkostnad och matcher"
                  />
                  <Step
                      icon={<Users className="h-4 w-4"/>}
                      title="Bjud in kompisar"
                      description="Dela länken med era spelkompisar"
                  />
                  <Step
                      icon={<TrendingUp className="h-4 w-4"/>}
                      title="Fyll i era kuponger"
                      description="Alla ska nå samma målkostnad"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/30 border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Ingen inloggning krävs.
                </p>
              </div>
            </aside>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Spela ansvarsfullt.</p>
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
        <div
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
  );
}
