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

export interface DrawResult {
  eventNumber: number;
  eventTypeId: number;
  cancelled: number;
  home: number;
  away: number;
  outcome: Outcome | "";
  matchResultState: number;
  matchResultStateText: string;
  time: string | null;
}

export interface ForecastResult {
  drawnum: number;
  drawState: number;
  drawStateText: string;
  cancelled: number;
  resultIdx: number;
  ref_resultIdx: number;
  unbettableWinrow: number;
  numVerifiedEventResults: number;
  totNumPartRows: number;
  numBoards: number;
  totalSales: string;
  numPartRows: number;
  time: string;
  changes?: Array<{
    evnum: number;
    team: string;
  }>;
  drawResults: DrawResult[];
}

export interface StryktipsetForecast {
  forecastResult: ForecastResult;
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
 * Fetches the live forecast/results for a specific draw number
 * This includes live match results and scores
 * (Fetches via our API route to avoid CORS)
 */
export async function fetchDrawForecast(drawNumber: number): Promise<StryktipsetForecast | null> {
  try {
    const response = await fetch(
      `/api/stryktipset/forecast/${drawNumber}`,
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      console.error(`Forecast API request failed: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
  }
}