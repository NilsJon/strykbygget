export type Outcome = "1" | "X" | "2";

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  distribution?: {
    one: string;
    x: string;
    two: string;
  };
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
  isYours?: boolean; // Whether this ticket belongs to the current user
}

export interface Room {
  id: string;
  name: string;
  targetCost: number;
  matches: Match[];
  tickets: Ticket[];
  createdAt: Date;
  drawNumber?: number; // Optional: used for fetching live results
}

export function calculateCombinations(selections: TicketSelection[]): number {
  if (selections.length === 0) return 0;

  return selections.reduce((total, selection) => {
    const count = selection.outcomes.length;
    return total * (count > 0 ? count : 1);
  }, 1);
}

/**
 * Calculates ticket cost. In Stryktipset, cost = number of combinations (1 SEK per row).
 */
export function calculateCost(combinations: number): number {
  return combinations;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
