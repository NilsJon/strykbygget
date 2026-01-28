import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  calculateCombinationsFromArray,
  validateTicket,
  hashClientId,
} from "@/lib/tipsLogic";
import type { Outcome } from "@/lib/types";

/**
 * Checks if the current Stryktipset draw is open
 */
async function isDrawOpen(): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api.spela.svenskaspel.se/draw/1/stryktipset/draws",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (!data.draws || data.draws.length === 0) {
      return false;
    }

    // Get the first open draw
    const currentDraw = data.draws.find((draw: any) => draw.drawState === "Open");

    return !!currentDraw;
  } catch (error) {
    console.error("Error checking draw state:", error);
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerName, selections, clientId } = body;

    // Validate input
    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(selections)) {
      return NextResponse.json(
        { error: "Selections must be an array" },
        { status: 400 }
      );
    }

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Check if draw is open (server-side validation)
    const drawIsOpen = await isDrawOpen();
    if (!drawIsOpen) {
      return NextResponse.json(
        { error: "Stryktipset är stängt. Du kan inte längre skicka in kuponger." },
        { status: 400 }
      );
    }

    // Hash the client ID
    const clientIdHash = hashClientId(clientId);

    // Initialize Firestore
    const { db } = getFirebaseAdmin();

    // Use a transaction to ensure atomicity
    const result = await db.runTransaction(async (transaction) => {
      const roomRef = db.collection("rooms").doc(roomId);
      const roomDoc = await transaction.get(roomRef);

      if (!roomDoc.exists) {
        throw new Error("Room not found");
      }

      const roomData = roomDoc.data()!;

      // Check if room is still open
      if (roomData.status !== "open") {
        throw new Error("Room is no longer accepting tickets");
      }

      // Check if client already submitted
      const existingTicketsQuery = await db
        .collection("rooms")
        .doc(roomId)
        .collection("tickets")
        .where("clientIdHash", "==", clientIdHash)
        .limit(1)
        .get();

      if (!existingTicketsQuery.empty) {
        throw new Error("You have already submitted a ticket for this room");
      }

      // Calculate combinations and cost (cost = combinations in Stryktipset)
      const combinations = calculateCombinationsFromArray(
        selections as Array<Array<Outcome>>
      );
      const cost = combinations;

      // Validate ticket
      const validation = validateTicket({
        selections: selections as Array<Array<Outcome>>,
        matchCount: roomData.matches.length,
        cost,
        targetCost: roomData.targetCost,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert nested array to array of objects (Firestore doesn't support nested arrays)
      const firestoreSelections = (selections as Array<Array<Outcome>>).map(
        (outcomes) => ({ outcomes })
      );

      // Create ticket
      const ticketRef = db
        .collection("rooms")
        .doc(roomId)
        .collection("tickets")
        .doc();

      const ticketData = {
        playerName: playerName.trim(),
        clientIdHash,
        selections: firestoreSelections,
        combinations,
        cost,
        createdAt: FieldValue.serverTimestamp(),
      };

      transaction.set(ticketRef, ticketData);

      return {
        id: ticketRef.id,
        ...ticketData,
        createdAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error submitting ticket:", error);

    // Return appropriate status code based on error
    const status = error.message?.includes("not found")
      ? 404
      : error.message?.includes("already submitted")
      ? 409
      : error.message?.includes("exceeds") ||
        error.message?.includes("no longer accepting")
      ? 400
      : 500;

    return NextResponse.json({ error: error.message }, { status });
  }
}
