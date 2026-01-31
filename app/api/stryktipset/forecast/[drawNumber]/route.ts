import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ drawNumber: string }> }
) {
  try {
    const { drawNumber } = await params;

    if (!drawNumber) {
      return NextResponse.json(
        { error: "Draw number is required" },
        { status: 400 }
      );
    }

    const url = `https://api.spela.svenskaspel.se/draw/1/stryktipset/draws/${drawNumber}`;
    const response = await fetch(url, {
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: `Draw ${drawNumber} not found. The draw may not exist or results may not be available yet.`,
            drawNumber: parseInt(drawNumber)
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `API request failed: ${response.status}`, drawNumber: parseInt(drawNumber) },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Draw API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
}
