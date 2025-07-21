/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "");

    let gameHistory;

    if (limit) {
      gameHistory = await db
        .collection("games")
        .find({ userId: userId })
        .sort({ date: -1 })
        .limit(limit)
        .toArray();
    } else {
      gameHistory = await db
        .collection("games")
        .find({ userId: userId })
        .sort({ date: -1 })
        .toArray();
    }

    const games = gameHistory.map(({ _id, ...rest }) => rest);

    return NextResponse.json({ gameHistory });
  } catch (error) {
    console.error("Error fetching user game history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
