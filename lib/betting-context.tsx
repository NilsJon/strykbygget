"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Room, Ticket, Match, TicketSelection } from "@/lib/types";
import { generateId, calculateCombinations, calculateCost, getRemainingBudget } from "@/lib/types";

interface BettingContextType {
  rooms: Record<string, Room>;
  createRoom: (name: string, totalBudget: number, pricePerCombination: number, matches: Match[]) => Room;
  getRoom: (id: string) => Room | undefined;
  submitTicket: (roomId: string, playerName: string, selections: TicketSelection[]) => Ticket | null;
  getRemainingBudgetForRoom: (roomId: string) => number;
}

const BettingContext = createContext<BettingContextType | null>(null);

export function BettingProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Record<string, Room>>({});

  const createRoom = useCallback((
    name: string,
    totalBudget: number,
    pricePerCombination: number,
    matches: Match[]
  ): Room => {
    const room: Room = {
      id: generateId(),
      name,
      totalBudget,
      pricePerCombination,
      matches,
      tickets: [],
      createdAt: new Date(),
    };

    setRooms(prev => ({
      ...prev,
      [room.id]: room,
    }));

    return room;
  }, []);

  const getRoom = useCallback((id: string): Room | undefined => {
    return rooms[id];
  }, [rooms]);

  const submitTicket = useCallback((
    roomId: string,
    playerName: string,
    selections: TicketSelection[]
  ): Ticket | null => {
    const room = rooms[roomId];
    if (!room) return null;

    const combinations = calculateCombinations(selections);
    const cost = calculateCost(combinations, room.pricePerCombination);
    const remaining = getRemainingBudget(room);

    if (cost > remaining) return null;

    const ticket: Ticket = {
      id: generateId(),
      playerName,
      selections,
      combinations,
      cost,
      submittedAt: new Date(),
    };

    setRooms(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        tickets: [...prev[roomId].tickets, ticket],
      },
    }));

    return ticket;
  }, [rooms]);

  const getRemainingBudgetForRoom = useCallback((roomId: string): number => {
    const room = rooms[roomId];
    if (!room) return 0;
    return getRemainingBudget(room);
  }, [rooms]);

  return (
    <BettingContext.Provider value={{
      rooms,
      createRoom,
      getRoom,
      submitTicket,
      getRemainingBudgetForRoom,
    }}>
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error("useBetting must be used within a BettingProvider");
  }
  return context;
}
