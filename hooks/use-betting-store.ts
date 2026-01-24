"use client";

import { useState, useCallback } from "react";
import type { Room, Ticket, Match, TicketSelection, Outcome } from "@/lib/types";
import { generateId, calculateCombinations, calculateCost, getRemainingBudget } from "@/lib/types";

// Simulated browser ID for demo purposes
const BROWSER_ID = typeof window !== "undefined" 
  ? localStorage.getItem("betting-browser-id") || (() => {
      const id = generateId();
      localStorage.setItem("betting-browser-id", id);
      return id;
    })()
  : "server";

interface BettingStore {
  rooms: Map<string, Room>;
  currentRoom: Room | null;
  browserId: string;
  createRoom: (name: string, totalBudget: number, pricePerCombination: number, matches: Match[]) => Room;
  getRoom: (id: string) => Room | undefined;
  setCurrentRoom: (room: Room | null) => void;
  submitTicket: (roomId: string, playerName: string, selections: TicketSelection[]) => Ticket | null;
  hasSubmitted: (roomId: string) => boolean;
  getRemainingBudget: (roomId: string) => number;
}

export function useBettingStore(): BettingStore {
  const [rooms, setRooms] = useState<Map<string, Room>>(new Map());
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

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

    setRooms(prev => {
      const newRooms = new Map(prev);
      newRooms.set(room.id, room);
      return newRooms;
    });

    return room;
  }, []);

  const getRoom = useCallback((id: string): Room | undefined => {
    return rooms.get(id);
  }, [rooms]);

  const submitTicket = useCallback((
    roomId: string,
    playerName: string,
    selections: TicketSelection[]
  ): Ticket | null => {
    const room = rooms.get(roomId);
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

    setRooms(prev => {
      const newRooms = new Map(prev);
      const updatedRoom = { ...room, tickets: [...room.tickets, ticket] };
      newRooms.set(roomId, updatedRoom);
      if (currentRoom?.id === roomId) {
        setCurrentRoom(updatedRoom);
      }
      return newRooms;
    });

    return ticket;
  }, [rooms, currentRoom]);

  const hasSubmitted = useCallback((roomId: string): boolean => {
    const room = rooms.get(roomId);
    if (!room) return false;
    // For demo, check by browser ID stored in ticket playerName prefix
    return room.tickets.some(t => t.id.includes(BROWSER_ID));
  }, [rooms]);

  const getRemainingBudgetForRoom = useCallback((roomId: string): number => {
    const room = rooms.get(roomId);
    if (!room) return 0;
    return getRemainingBudget(room);
  }, [rooms]);

  return {
    rooms,
    currentRoom,
    browserId: BROWSER_ID,
    createRoom,
    getRoom,
    setCurrentRoom,
    submitTicket,
    hasSubmitted,
    getRemainingBudget: getRemainingBudgetForRoom,
  };
}
