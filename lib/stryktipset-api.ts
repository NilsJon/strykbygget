/**
 * Client-side utilities for fetching Stryktipset data via our API route
 */

import type { Outcome } from "./types";

export interface StryktipsetMatch {
  eventNumber: number;
  eventDescription: string;
  home: string;
  away: string;
  matchStart: string;
  distribution?: {
    one: string;
    x: string;
    two: string;
  };
}

export interface StryktipsetDraw {
  drawNumber: number;
  weekNumber: number;
  regCloseTime: string;
  drawState: string;
  matches: StryktipsetMatch[];
}

export interface MatchResult {
  type: number;
  sportEventResultType: string;
  description: string;
  home: string;
  away: string;
}

export interface DrawEvent {
  cancelled: boolean;
  eventNumber: number;
  eventDescription: string;
  match: {
    matchId: number;
    matchStart: string;
    status: string;
    statusId: number;
    sportEventStatus: string;
    result: MatchResult[];
    participants: Array<{
      id: number;
      type: string;
      name: string;
      result: string;
    }>;
  };
  svenskaFolket?: {
    one: string;
    x: string;
    two: string;
    date: string;
  };
  betMetrics?: {
    values: Array<{
      outcome: string;
      distribution: {
        distribution: string;
      };
    }>;
  };
}

export interface StryktipsetDrawResponse {
  draw: {
    drawNumber: number;
    drawState: string;
    drawStateId: number;
    regCloseTime: string;
    drawEvents: DrawEvent[];
  };
}

export interface ProcessedDrawResult {
  eventNumber: number;
  outcome: Outcome | null; // null means game hasn't started
  homeScore: string;
  awayScore: string;
}

/**
 * Fetches the current/upcoming Stryktipset draw from our API route
 * (which fetches from Svenska Spel API server-side to avoid CORS)
 */
export async function fetchCurrentStryktipsetDraw(): Promise<StryktipsetDraw | null> {
  try {
    const response = await fetch("/api/stryktipset/current", {
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Stryktipset data:", error);
    return null;
  }
}

/**
 * Calculate outcome from home and away scores
 */
function calculateOutcome(homeScore: string, awayScore: string): Outcome {
  const home = parseInt(homeScore);
  const away = parseInt(awayScore);

  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

/**
 * Fetches a specific draw by draw number
 * Returns the same format as fetchCurrentStryktipsetDraw
 * (Fetches via our API route to avoid CORS)
 */
export async function fetchSpecificDraw(drawNumber: number): Promise<StryktipsetDraw | null> {
  try {
    const response = await fetch(
      `/api/stryktipset/forecast/${drawNumber}`,
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      console.error(`Draw API request failed: ${response.status}`);
      return null;
    }

    const data: StryktipsetDrawResponse = await response.json();

    if (!data.draw || !data.draw.drawEvents) {
      console.error("Invalid draw data structure");
      return null;
    }

    // Extract matches from draw events
    const matches: StryktipsetMatch[] = data.draw.drawEvents
      .filter((event) => !event.cancelled)
      .sort((a, b) => a.eventNumber - b.eventNumber)
      .map((event) => {
        // Get distribution data (prefer svenskaFolket, fallback to betMetrics)
        let distribution;
        if (event.svenskaFolket) {
          distribution = {
            one: event.svenskaFolket.one,
            x: event.svenskaFolket.x,
            two: event.svenskaFolket.two,
          };
        } else if (event.betMetrics?.values) {
          // Extract from betMetrics if svenskaFolket not available
          const values = event.betMetrics.values;
          const outcome1 = values.find((v) => v.outcome === "1");
          const outcomeX = values.find((v) => v.outcome === "X");
          const outcome2 = values.find((v) => v.outcome === "2");

          if (outcome1 && outcomeX && outcome2) {
            distribution = {
              one: outcome1.distribution.distribution,
              x: outcomeX.distribution.distribution,
              two: outcome2.distribution.distribution,
            };
          }
        }

        return {
          eventNumber: event.eventNumber,
          eventDescription: event.eventDescription,
          home: event.match.participants.find((p) => p.type === "home")?.name || "",
          away: event.match.participants.find((p) => p.type === "away")?.name || "",
          matchStart: event.match.matchStart,
          distribution,
        };
      });

    // Extract week number from close time
    const regCloseTime = data.draw.regCloseTime;
    const weekNumber = extractWeekNumber(regCloseTime);

    return {
      drawNumber: data.draw.drawNumber,
      weekNumber,
      regCloseTime,
      drawState: data.draw.drawState,
      matches,
    };
  } catch (error) {
    console.error("Error fetching specific draw:", error);
    return null;
  }
}

/**
 * Extracts the calendar week number from a date string
 */
function extractWeekNumber(dateString: string): number {
  const date = new Date(dateString);

  // ISO 8601 week number calculation
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return weekNum;
}

/**
 * Fetches the live draw data for a specific draw number
 * This includes live match results and scores
 * (Fetches via our API route to avoid CORS)
 */
export async function fetchDrawForecast(drawNumber: number): Promise<{ results: ProcessedDrawResult[]; roundStarted: boolean } | null> {
  try {
    const response = await fetch(
      `/api/stryktipset/forecast/${drawNumber}`,
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      console.error(`Draw API request failed: ${response.status}`);
      return null;
    }

    const data: StryktipsetDrawResponse = await response.json();

    if (!data.draw || !data.draw.drawEvents) {
      console.error("Invalid draw data structure");
      return null;
    }

    // Process events to extract current results
    const results: ProcessedDrawResult[] = data.draw.drawEvents
      .filter(event => !event.cancelled)
      .sort((a, b) => a.eventNumber - b.eventNumber)
      .map(event => {
        // Find the "Current" result
        const currentResult = event.match.result?.find(
          r => r.sportEventResultType === "Current"
        );

        if (currentResult) {
          return {
            eventNumber: event.eventNumber,
            outcome: calculateOutcome(currentResult.home, currentResult.away),
            homeScore: currentResult.home,
            awayScore: currentResult.away,
          };
        }

        // Game hasn't started - treat as 0-0
        return {
          eventNumber: event.eventNumber,
          outcome: null, // null indicates game hasn't started
          homeScore: "0",
          awayScore: "0",
        };
      });

    // Check if round has started (at least one game has a result)
    const roundStarted = results.some(r => r.outcome !== null);

    return { results, roundStarted };
  } catch (error) {
    console.error("Error fetching draw data:", error);
    return null;
  }
}