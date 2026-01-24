import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { hashClientId } from "@/lib/tipsLogic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { db } = getFirebaseAdmin();

    // Get clientId from query params to identify user's ticket
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const clientIdHash = clientId ? hashClientId(clientId) : null;

    // Get room document
    const roomRef = db.collection("rooms").doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const roomData = roomDoc.data()!;

    // Get all tickets for this room
    const ticketsSnapshot = await roomRef
      .collection("tickets")
      .orderBy("createdAt", "asc")
      .get();

    const tickets = ticketsSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert Firestore format back to nested array
      // Firestore: [{outcomes: ["1"]}, {outcomes: ["X", "2"]}]
      // UI: [["1"], ["X", "2"]]
      const selections = data.selections.map((s: any) => s.outcomes);

      // Check if this ticket belongs to the current user
      const isYours = clientIdHash && data.clientIdHash === clientIdHash;

      return {
        id: doc.id,
        playerName: data.playerName,
        selections,
        combinations: data.combinations,
        cost: data.cost,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isYours,
      };
    });

    // Return room with tickets
    return NextResponse.json({
      id: roomDoc.id,
      title: roomData.title,
      targetCost: roomData.targetCost,
      status: roomData.status,
      matches: roomData.matches,
      createdAt: roomData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      tickets,
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch room" },
      { status: 500 }
    );
  }
}
