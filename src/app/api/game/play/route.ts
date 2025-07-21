/* eslint-disable @typescript-eslint/no-unused-vars */
import { addGameResult, increaseUserBalance } from "@/app/actions";
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    const generatedNumber = Math.floor(Math.random() * 101);
    const balanceChange = generatedNumber > 70 ? 50 : -35;

    // Get user balance from database
    const user = await db
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = user?.balance || 0;
    const newBalance = balance + balanceChange;

    await addGameResult({
      generatedNumber,
      result: generatedNumber > 70,
      balanceChange,
      newBalance,
      date: new Date(),
      userId,
    });

    await increaseUserBalance(userId, balanceChange);

    const result = generatedNumber > 70 ? "gagné" : "perdu";

    return NextResponse.json({ result: result, newBalance, generatedNumber });
  } catch (error) {
    return NextResponse.json({ error: "Failed to play game" }, { status: 500 });
  }
}
