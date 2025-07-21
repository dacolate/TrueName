/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "");

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

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

    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
