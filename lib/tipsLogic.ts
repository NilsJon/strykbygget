import crypto from "crypto";
import type { Outcome, Match, Ticket, TicketSelection } from "./types";

/**
 * Generates a hash of the client identifier for tracking unique submissions
 */
export function hashClientId(clientId: string): string {
  return crypto.createHash("sha256").update(clientId).digest("hex");
}

/**
 * Factorize a number into 2^a * 3^b
 */
function factorize(n: number): { twos: number; threes: number } | null {
  if (n <= 0 || !Number.isInteger(n)) return null;

  let remaining = n;
  let twos = 0;
  let threes = 0;

  while (remaining % 2 === 0) {
    twos++;
    remaining /= 2;
  }

  while (remaining % 3 === 0) {
    threes++;
    remaining /= 3;
  }

  // If there's a remainder, the number cannot be expressed as 2^a * 3^b
  if (remaining !== 1) return null;

  return { twos, threes };
}

/**
 * Count votes for each outcome in a specific match
 */
interface VoteCount {
  "1": number;
  "X": number;
  "2": number;
}

function countVotes(tickets: Ticket[], matchId: string): VoteCount {
  const votes: VoteCount = { "1": 0, "X": 0, "2": 0 };

  tickets.forEach((ticket) => {
    const selection = ticket.selections.find((s) => s.matchId === matchId);
    if (selection) {
      selection.outcomes.forEach((outcome) => {
        votes[outcome]++;
      });
    }
  });

  return votes;
}

/**
 * Rank outcomes by votes (descending)
 */
function rankOutcomes(votes: VoteCount): Outcome[] {
  return (["1", "X", "2"] as Outcome[]).sort((a, b) => votes[b] - votes[a]);
}

/**
 * Calculate uncertainty scores for each match
 */
interface MatchScore {
  matchId: string;
  score2: number; // score for adding 2nd pick
  score3: number; // score for adding 3rd pick
  ranked: Outcome[]; // outcomes ranked by votes
}

function calculateMatchScores(
  matches: Match[],
  tickets: Ticket[]
): MatchScore[] {
  return matches.map((match) => {
    const votes = countVotes(tickets, match.id);
    const ranked = rankOutcomes(votes);

    const top1Votes = votes[ranked[0]];
    const top2Votes = votes[ranked[1]];
    const top3Votes = votes[ranked[2]];

    // Uncertainty score: higher means more people voted for this option relative to top pick
    const score2 = top2Votes / Math.max(top1Votes, 1);
    const score3 = top3Votes / Math.max(top1Votes, 1);

    return {
      matchId: match.id,
      score2,
      score3,
      ranked,
    };
  });
}

/**
 * Generate final ticket that costs exactly targetCost while reflecting group votes
 */
export function generateFinalTicket(
  matches: Match[],
  tickets: Ticket[],
  targetCost: number
): TicketSelection[] | null {
  if (tickets.length === 0) return null;

  // Factorize targetCost into 2^a * 3^b
  const factors = factorize(targetCost);
  if (!factors) {
    return null; // Cannot express as 2^a * 3^b
  }

  const { twos, threes } = factors;

  // Calculate match scores based on votes
  const matchScores = calculateMatchScores(matches, tickets);

  // Sort matches by uncertainty scores
  const sortedByScore2 = [...matchScores].sort((a, b) => b.score2 - a.score2);
  const sortedByScore3 = [...matchScores].sort((a, b) => b.score3 - a.score3);

  // Assign number of picks to each match (start with 1 pick each)
  const picks: Map<string, number> = new Map();
  matches.forEach((match) => picks.set(match.id, 1));

  // First, assign 3 picks to the top `threes` matches by score3
  for (let i = 0; i < threes && i < sortedByScore3.length; i++) {
    picks.set(sortedByScore3[i].matchId, 3);
  }

  // Then, assign 2 picks to the top `twos` matches by score2 (that don't already have 3 picks)
  let twosAssigned = 0;
  for (let i = 0; i < sortedByScore2.length && twosAssigned < twos; i++) {
    const matchId = sortedByScore2[i].matchId;
    if (picks.get(matchId) !== 3) {
      picks.set(matchId, 2);
      twosAssigned++;
    }
  }

  // Build final selections with top-voted outcomes
  return matches.map((match) => {
    const numPicks = picks.get(match.id)!;
    const matchScore = matchScores.find((ms) => ms.matchId === match.id)!;
    return {
      matchId: match.id,
      outcomes: matchScore.ranked.slice(0, numPicks),
    };
  });
}

/**
 * Calculates the number of combinations from a selections array
 * selections is an array where each element is an array of outcomes for that match
 */
export function calculateCombinationsFromArray(
  selections: Array<Array<Outcome>>
): number {
  if (selections.length === 0) return 0;

  return selections.reduce((total, matchSelections) => {
    const count = matchSelections.length;
    return total * (count > 0 ? count : 1);
  }, 1);
}

/**
 * Validates that a ticket can be submitted
 */
export function validateTicket(params: {
  selections: Array<Array<Outcome>>;
  matchCount: number;
  cost: number;
  targetCost: number;
}): { valid: boolean; error?: string } {
  const { selections, matchCount, cost, targetCost } = params;

  // Check that we have selections for all matches
  if (selections.length !== matchCount) {
    return {
      valid: false,
      error: `Expected ${matchCount} matches but got ${selections.length}`,
    };
  }

  // Check that each match has at least one selection
  for (let i = 0; i < selections.length; i++) {
    if (selections[i].length === 0) {
      return {
        valid: false,
        error: `Match ${i + 1} has no selections`,
      };
    }

    // Validate outcomes
    for (const outcome of selections[i]) {
      if (!["1", "X", "2"].includes(outcome)) {
        return {
          valid: false,
          error: `Invalid outcome "${outcome}" in match ${i + 1}`,
        };
      }
    }
  }

  // Check that cost exactly matches target cost
  if (cost !== targetCost) {
    return {
      valid: false,
      error: `Ticket cost (${cost} kr) must equal target cost (${targetCost} kr)`,
    };
  }

  return { valid: true };
}
