import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, targetCost, matches } = body;

    // Validate required fields
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Room title is required" },
        { status: 400 }
      );
    }

    if (!targetCost || typeof targetCost !== "number" || targetCost <= 0) {
      return NextResponse.json(
        { error: "Valid target cost is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { error: "At least one match is required" },
        { status: 400 }
      );
    }

    // Validate and transform matches
    // Note: We intentionally do NOT store distribution as it changes throughout the week
    const firestoreMatches = matches.map((match: any, index: number) => {
      if (!match.home || !match.away) {
        throw new Error(`Match ${index + 1} must have home and away teams`);
      }
      return {
        home: match.home,
        away: match.away,
      };
    });

    // Initialize Firestore
    const { db } = getFirebaseAdmin();

    // Create room document
    const roomRef = db.collection("rooms").doc();
    const roomData = {
      title: title.trim(),
      createdAt: FieldValue.serverTimestamp(),
      status: "open",
      targetCost,
      matches: firestoreMatches,
    };

    await roomRef.set(roomData);

    // Return the created room with ID
    return NextResponse.json({
      id: roomRef.id,
      ...roomData,
      createdAt: new Date().toISOString(), // Client-friendly timestamp
    });
  } catch (error: any) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
