import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json([]);
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const users = await User.find().select(
      "firstName lastName dob role"
    );

    return NextResponse.json(users ?? []);
  } catch (err) {
    console.error("Birthday API error:", err);
    return NextResponse.json([]);
  }
}
