import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    const managers = await User.find({
      role: { $in: ["superAdmin", "CXO/HR", "techManager", "employee"] },
    })
      .select("firstName lastName employeeId role")
      .lean();

    return NextResponse.json(managers);

  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
