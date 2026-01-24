"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoomView } from "@/components/room-view";
import type { Room, Match, Ticket, TicketSelection } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { getClientId } from "@/lib/utils";

// API response types matching Firestore structure
interface FirestoreMatch {
  home: string;
  away: string;
}

interface FirestoreTicket {
  id: string;
  playerName: string;
  selections: Array<Array<"1" | "X" | "2">>;
  combinations: number;
  cost: number;
  createdAt: string;
  isYours?: boolean;
}

interface FirestoreRoom {
  id: string;
  title: string;
  targetCost: number;
  status: string;
  matches: FirestoreMatch[];
  createdAt: string;
  tickets: FirestoreTicket[];
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const clientId = getClientId();
        const response = await fetch(`/api/rooms/${roomId}?clientId=${encodeURIComponent(clientId)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Room not found");
          } else {
            setError("Failed to load room");
          }
          setLoading(false);
          return;
        }

        const data: FirestoreRoom = await response.json();

        // Convert Firestore format to UI format
        const matches: Match[] = data.matches.map((match, index) => ({
          id: `match-${index}`,
          teamA: match.home,
          teamB: match.away,
        }));

        const tickets: Ticket[] = data.tickets.map((ticket) => {
          const selections: TicketSelection[] = ticket.selections.map(
            (outcomes, index) => ({
              matchId: `match-${index}`,
              outcomes,
            })
          );

          return {
            id: ticket.id,
            playerName: ticket.playerName,
            selections,
            combinations: ticket.combinations,
            cost: ticket.cost,
            submittedAt: new Date(ticket.createdAt),
            isYours: ticket.isYours,
          };
        });

        const convertedRoom: Room = {
          id: data.id,
          name: data.title,
          targetCost: data.targetCost,
          matches,
          tickets,
          createdAt: new Date(data.createdAt),
        };

        setRoom(convertedRoom);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching room:", err);
        setError(err.message || "Failed to load room");
        setLoading(false);
      }
    };

    fetchRoom();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRoom, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  const handleBack = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Laddar rum...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {error || "Rummet hittades inte"}
          </h1>
          <p className="text-muted-foreground mb-6">
            Detta rum kanske inte finns eller så uppstod ett fel vid laddning.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tillbaka till start
          </button>
        </div>
      </div>
    );
  }

  return <RoomView room={room} onBack={handleBack} />;
}
