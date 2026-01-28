import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const response = await fetch(
      "https://api.spela.svenskaspel.se/draw/1/stryktipset/draws",
      {
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.draws || data.draws.length === 0) {
      return NextResponse.json(
        { error: "No draws found" },
        { status: 404 }
      );
    }

    // Get the first open draw (current/upcoming)
    const currentDraw = data.draws.find(
      (draw: any) => draw.drawState === "Open"
    );

    if (!currentDraw) {
      return NextResponse.json(
        { error: "No open draws found" },
        { status: 404 }
      );
    }

    // Extract matches from draw events
    const matches: StryktipsetMatch[] = currentDraw.drawEvents
      .filter((event: any) => !event.cancelled)
      .map((event: any) => {
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
          const outcome1 = values.find((v: any) => v.outcome === "1");
          const outcomeX = values.find((v: any) => v.outcome === "X");
          const outcome2 = values.find((v: any) => v.outcome === "2");

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
          home: event.match.participants.find((p: any) => p.type === "home")?.name || "",
          away: event.match.participants.find((p: any) => p.type === "away")?.name || "",
          matchStart: event.match.matchStart,
          distribution,
        };
      })
      .sort((a: StryktipsetMatch, b: StryktipsetMatch) => a.eventNumber - b.eventNumber);

    // Extract week number from close time
    const weekNumber = extractWeekNumber(currentDraw.regCloseTime);

    const draw: StryktipsetDraw = {
      drawNumber: currentDraw.drawNumber,
      weekNumber,
      regCloseTime: currentDraw.regCloseTime,
      drawState: currentDraw.drawState,
      matches,
    };

    return NextResponse.json(draw);
  } catch (error: any) {
    console.error("Error fetching Stryktipset data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Stryktipset data" },
      { status: 500 }
    );
  }
}
