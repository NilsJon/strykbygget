export type Outcome = "1" | "X" | "2";

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
}

export interface TicketSelection {
  matchId: string;
  outcomes: Outcome[];
}

export interface Ticket {
  id: string;
  playerName: string;
  selections: TicketSelection[];
  combinations: number;
  cost: number;
  submittedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  totalBudget: number;
  pricePerCombination: number;
  matches: Match[];
  tickets: Ticket[];
  createdAt: Date;
}

export function calculateCombinations(selections: TicketSelection[]): number {
  if (selections.length === 0) return 0;
  
  return selections.reduce((total, selection) => {
    const count = selection.outcomes.length;
    return total * (count > 0 ? count : 1);
  }, 1);
}

export function calculateCost(combinations: number, pricePerCombination: number): number {
  return combinations * pricePerCombination;
}

export function getRemainingBudget(room: Room): number {
  const usedBudget = room.tickets.reduce((sum, ticket) => sum + ticket.cost, 0);
  return room.totalBudget - usedBudget;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
