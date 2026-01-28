/**
 * Client-side utilities for fetching Stryktipset data via our API route
 */

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