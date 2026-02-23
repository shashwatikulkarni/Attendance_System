import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";
import { evaluateAttendance } from "@/lib/attendanceLogic";


/* ================= TYPES ================= */
interface TokenPayload {
  userId: string;
  role: "superAdmin" | "HR" | "CXO/HR" | "techManager" | "employee" | "intern";
}

/* ================= POST ================= */
/* Admin / HR / Manager override attendance */
export async function POST(req: Request) {
  try {
    await dbConnect();

    /* ---------- AUTH ---------- */
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    /* ---------- ROLE CHECK ---------- */
    const ALLOWED = ["superAdmin", "HR", "CXO/HR", "techManager"];
    if (!ALLOWED.includes(decoded.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* ---------- BODY ---------- */
    const body = await req.json();
    const {
  userId,
  date,
  startTime,
  endTime,
} = body;


    if (!userId || !date ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!startTime || !endTime) {
  return NextResponse.json(
    { error: "Start and end time required" },
    { status: 400 }
  );
}

const evaluation = evaluateAttendance(startTime, endTime);

if (!evaluation.allowed) {
  return NextResponse.json(
    { error: evaluation.reason },
    { status: 400 }
  );
}

    const { attendanceType } = evaluation;

    /* ---------- NORMALIZE DATE ---------- */
    const attendanceDate = new Date(`${date}T00:00:00`);
    attendanceDate.setHours(0, 0, 0, 0);

    /* ---------- UPSERT (CREATE OR UPDATE) ---------- */
    await Attendance.findOneAndUpdate(
  { userId, date: attendanceDate },
  {
    userId,
    date: attendanceDate,
    startTime,
    endTime,
    attendanceType: evaluation.attendanceType,
    late: evaluation.late,
    status: "pending",
    approvedBy: decoded.userId,
  },
  { upsert: true, new: true }
);


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin attendance override error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
