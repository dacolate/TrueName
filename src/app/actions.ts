/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { UserWithRole } from "better-auth/plugins";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function addGameResult(result: {
  generatedNumber: number;
  result: boolean;
  balanceChange: number;
  newBalance: number;
  date: Date;
  userId: string;
}) {
  try {
    // Generate unique ID
    const gameId = Date.now().toString();

    const gameRecord = {
      id: gameId,
      date: new Date(),
      generatedNumber: result.generatedNumber,
      result: result.result,
      balanceChange: result.balanceChange,
      newBalance: result.newBalance,
      userId: result.userId,
    };
    // Insert and get full document (with _id)
    const inserted = await db.collection("games").insertOne(gameRecord);

    // Attach _id temporarily just to remove it
    const fullGame = { ...gameRecord, _id: inserted.insertedId };

    // Remove _id
    const { _id, ...cleanedGame } = fullGame;

    return { success: true, cleanedGame };
  } catch (error) {
    console.error("Error adding game result:", error);
    return { success: false, error };
  }
}

export async function increaseUserBalance(userId: string, amount: number) {
  try {
    await db
      .collection("user")
      .updateOne({ _id: new ObjectId(userId) }, { $inc: { balance: amount } });

    // Revalidate cache
    revalidateTag("user-data");

    return { success: true };
  } catch (error) {
    console.error("Error updating balance:", error);
    return { success: false, error };
  }
}

export async function getUserGameHistory(userId: string, limit?: number) {
  const games = db
    .collection("games")
    .find({ userId: userId })
    .sort({ date: -1 });
  if (!limit || limit <= 0) {
    const gamesArray = games.toArray();
    return (await gamesArray).map((game) => ({
      id: game._id.toString(), // convert ObjectId to string
      date: game.date instanceof Date ? game.date.toISOString() : game.date,
      generatedNumber: game.generatedNumber,
      result: game.result,
      balanceChange: game.balanceChange,
      newBalance: game.newBalance,
      userId: game.userId,
    }));
  } else {
    const gamesArray = games.limit(limit).toArray();
    return (await gamesArray).map((game) => ({
      id: game._id.toString(), // convert ObjectId to string
      date: game.date instanceof Date ? game.date.toISOString() : game.date,
      generatedNumber: game.generatedNumber,
      result: game.result,
      balanceChange: game.balanceChange,
      newBalance: game.newBalance,
      userId: game.userId,
    }));
  }
}

export async function getUsers(): Promise<UserWithRole[]> {
  const users = await auth.api.listUsers({
    query: {
      searchValue: "",
      searchField: "name",
      searchOperator: "contains",
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  return users?.users || [];
}

type ApiResponse<T> = {
  success: boolean;
  loading: boolean;
  error: string | null;
  data: T | null;
};

export async function editUserInMongo(
  userId: string,
  updates: Partial<UserWithRole>
): Promise<ApiResponse<UserWithRole>> {
  // Initial loading state
  let response: ApiResponse<UserWithRole> = {
    success: false,
    loading: true,
    error: null,
    data: null,
  };

  try {
    const objectId = new ObjectId(userId);

    const { id, createdAt, ...updateData } = updates;
    updateData.updatedAt = new Date();

    const result = await db
      .collection("user")
      .findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: "after" }
      );

    revalidateTag("user-data");
    revalidateTag("admin-users");

    if (result === null) {
      console.error("User not found or no changes made:", userId);
      throw new Error("User not found or no changes made");
    }

    const updatedUser: UserWithRole = {
      id: userId,
      name: result.name,
      email: result.email,
      emailVerified: result.emailVerified || false,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      role: result.role || "user",
      ...(result.phone && { phone: result.phone }),
      ...(result.balance && { balance: result.balance }),
      ...(result.banned && { banned: result.banned }),
      ...(result.banReason && { banReason: result.banReason }),
      ...(result.banExpires && { banExpires: result.banExpires }),
    };

    // Success state
    response = {
      success: true,
      loading: false,
      error: null,
      data: updatedUser,
    };

    return response;
  } catch (error) {
    console.error("MongoDB edit user error:", error);

    // Error state
    response = {
      success: false,
      loading: false,
      error: error instanceof Error ? error.message : "Failed to update user",
      data: null,
    };

    return response;
  }
}
