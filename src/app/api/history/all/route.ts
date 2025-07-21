/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "");

    // check if user is admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" });
    }

    let gameHistory;

    if (limit) {
      gameHistory = await db
        .collection("games")
        .find({}) // No filter — get all games
        .sort({ date: -1 })
        .limit(limit)
        .toArray();
    } else {
      gameHistory = await db
        .collection("games")
        .find({})
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
