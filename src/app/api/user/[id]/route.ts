/* eslint-disable @typescript-eslint/no-unused-vars */
import { editUserInMongo } from "@/app/actions";
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin"]).optional(),
  balance: z.number().optional(),
  phone: z.string().min(8).max(15).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // check if user is admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" });
    }
    const { id: userId } = await params;

    // Get user balance from database
    const user = await db
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    const json = await request.json();

    const parsed = userUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const response = await editUserInMongo(userId, parsed.data);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || "Update failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: response.data });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
