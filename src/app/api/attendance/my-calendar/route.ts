import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

interface TokenPayload {
  userId: string;
}

export async function GET() {
  try {
    await dbConnect();

    /* ================= AUTH ================= */
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    /* ================= FETCH ONLY OWN DATA ================= */
    const records = await Attendance.find({
      userId: decoded.userId,
    })
      .select(
        "date startTime endTime attendanceType status"
      )
      .sort({ date: 1 })
      .lean();

    /* ================= FORMAT FOR CALENDAR ================= */
    const formatted = records.map((r) => ({
      date: r.date,
      startTime: r.startTime ?? null,
      endTime: r.endTime ?? null,
      attendanceType: r.attendanceType, // 🔥 FROM DB
      status: r.status,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Attendance calendar error:", error);
    return NextResponse.json(
      { error: "Failed to load attendance history" },
      { status: 500 }
    );
  }
}
