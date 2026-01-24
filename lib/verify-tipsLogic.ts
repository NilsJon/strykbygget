/**
 * Verification script for final ticket generation logic
 * Run with: npx tsx lib/verify-tipsLogic.ts
 */

import { generateFinalTicket, calculateCombinationsFromArray } from "./tipsLogic";
import type { Match, Ticket } from "./types";

const matches: Match[] = [
  { id: "1", teamA: "Team A1", teamB: "Team B1" },
  { id: "2", teamA: "Team A2", teamB: "Team B2" },
  { id: "3", teamA: "Team A3", teamB: "Team B3" },
  { id: "4", teamA: "Team A4", teamB: "Team B4" },
];

function testCase(name: string, tickets: Ticket[], targetCost: number, expectedCost: number | null) {
  console.log(`\n🧪 Test: ${name}`);
  console.log(`   Target cost: ${targetCost} kr`);

  const result = generateFinalTicket(matches, tickets, targetCost);

  if (expectedCost === null) {
    if (result === null) {
      console.log("   ✅ Correctly returned null (invalid target cost)");
    } else {
      console.log("   ❌ Expected null but got a result");
      console.log("   Result:", result);
    }
    return;
  }

  if (!result) {
    console.log("   ❌ Expected a result but got null");
    return;
  }

  const actualCost = calculateCombinationsFromArray(result.map((s) => s.outcomes));

  if (actualCost === expectedCost) {
    console.log(`   ✅ Cost matches exactly: ${actualCost} kr`);
  } else {
    console.log(`   ❌ Cost mismatch: expected ${expectedCost} kr, got ${actualCost} kr`);
  }

  console.log("   Match picks:");
  result.forEach((selection, idx) => {
    const match = matches[idx];
    console.log(
      `     ${idx + 1}. ${match.teamA} vs ${match.teamB}: ${selection.outcomes.join("")} (${selection.outcomes.length} picks)`
    );
  });
}

console.log("=".repeat(60));
console.log("Final Ticket Generation - Verification");
console.log("=".repeat(60));

// Test 1: Target cost = 1 (single pick per match)
testCase(
  "Target cost = 1",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1"] },
        { matchId: "2", outcomes: ["X"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 1,
      cost: 1,
      submittedAt: new Date(),
    },
  ],
  1,
  1
);

// Test 2: Target cost = 2 (one 2-pick match)
testCase(
  "Target cost = 2",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1"] },
        { matchId: "2", outcomes: ["X"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 1,
      cost: 1,
      submittedAt: new Date(),
    },
    {
      id: "t2",
      playerName: "Player 2",
      selections: [
        { matchId: "1", outcomes: ["X"] }, // Disagree on match 1
        { matchId: "2", outcomes: ["X"] },
        { matchId: "3", outcomes: ["1"] }, // Disagree on match 3
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 1,
      cost: 1,
      submittedAt: new Date(),
    },
  ],
  2,
  2
);

// Test 3: Target cost = 4 (two 2-pick matches)
testCase(
  "Target cost = 4",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1", "X"] },
        { matchId: "2", outcomes: ["X"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 2,
      cost: 2,
      submittedAt: new Date(),
    },
    {
      id: "t2",
      playerName: "Player 2",
      selections: [
        { matchId: "1", outcomes: ["X"] },
        { matchId: "2", outcomes: ["1", "X"] },
        { matchId: "3", outcomes: ["1", "2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 2,
      cost: 2,
      submittedAt: new Date(),
    },
  ],
  4,
  4
);

// Test 4: Target cost = 6 (one 2-pick and one 3-pick match)
testCase(
  "Target cost = 6",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1", "X"] },
        { matchId: "2", outcomes: ["X", "2"] },
        { matchId: "3", outcomes: ["1", "2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 4,
      cost: 4,
      submittedAt: new Date(),
    },
    {
      id: "t2",
      playerName: "Player 2",
      selections: [
        { matchId: "1", outcomes: ["X", "2"] },
        { matchId: "2", outcomes: ["1", "X"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1", "X"] },
      ],
      combinations: 4,
      cost: 4,
      submittedAt: new Date(),
    },
  ],
  6,
  6
);

// Test 5: Invalid target cost (5 cannot be expressed as 2^a × 3^b)
testCase(
  "Invalid target cost = 5",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1"] },
        { matchId: "2", outcomes: ["X"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1"] },
      ],
      combinations: 1,
      cost: 1,
      submittedAt: new Date(),
    },
  ],
  5,
  null
);

// Test 6: Target cost = 12 (two 2-picks and one 3-pick: 2^2 × 3^1)
testCase(
  "Target cost = 12",
  [
    {
      id: "t1",
      playerName: "Player 1",
      selections: [
        { matchId: "1", outcomes: ["1", "X", "2"] },
        { matchId: "2", outcomes: ["X", "2"] },
        { matchId: "3", outcomes: ["1", "2"] },
        { matchId: "4", outcomes: ["1", "X"] },
      ],
      combinations: 12,
      cost: 12,
      submittedAt: new Date(),
    },
    {
      id: "t2",
      playerName: "Player 2",
      selections: [
        { matchId: "1", outcomes: ["X", "2"] },
        { matchId: "2", outcomes: ["1", "X", "2"] },
        { matchId: "3", outcomes: ["2"] },
        { matchId: "4", outcomes: ["1", "X"] },
      ],
      combinations: 6,
      cost: 6,
      submittedAt: new Date(),
    },
  ],
  12,
  12
);

console.log("\n" + "=".repeat(60));
console.log("Verification complete!");
console.log("=".repeat(60));
