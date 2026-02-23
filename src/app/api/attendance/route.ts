import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { evaluateAttendance } from "@/lib/attendanceLogic";

interface TokenPayload {
  userId: string;
  role: "superAdmin" | "CXO/HR" | "techManager" | "employee" | "intern";
}

const ROLE_HIERARCHY: Record<TokenPayload["role"], TokenPayload["role"][]> = {
  superAdmin: ["CXO/HR", "techManager", "employee", "intern"],
  "CXO/HR": ["techManager", "employee", "intern"],
  techManager: ["employee", "intern"],
  employee: [],
  intern: [],
};

export async function GET() {
  try {
    await dbConnect();

    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    let query: Record<string, unknown> = {};

    if (decoded.role === "intern" || decoded.role === "employee") {
      query = { userId: decoded.userId };
    } else {
      const allowedRoles = ROLE_HIERARCHY[decoded.role];

      const users = await User.find({
        role: { $in: allowedRoles },
      }).select("_id");

      query = { userId: { $in: users.map((u) => u._id) } };
    }

    const data = await Attendance.find(query)
      .populate("userId", "firstName role employeeId")
      .populate("approvedBy", "firstName role")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load attendance" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

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
    ) as { userId: string };

    const body = await req.json();
    const { date, startTime, endTime, leave } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(`${date}T00:00:00`);
    attendanceDate.setHours(0, 0, 0, 0);

    /* ================= LEAVE CASE ================= */

    if (leave === true) {
      await Attendance.findOneAndUpdate(
        { userId: decoded.userId, date: attendanceDate },
        {
          userId: decoded.userId,
          date: attendanceDate,
          attendanceType: "Absent",
          startTime: null,
          endTime: null,
          late: false,
          status: "pending",
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: "Leave marked successfully",
      });
    }

    /* ================= NORMAL ATTENDANCE ================= */

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start and End time required" },
        { status: 400 }
      );
    }

    // Your evaluation logic here
    const evaluation = evaluateAttendance(startTime, endTime);

    if (!evaluation.allowed) {
      return NextResponse.json(
        { error: evaluation.reason },
        { status: 400 }
      );
    }

    await Attendance.findOneAndUpdate(
      { userId: decoded.userId, date: attendanceDate },
      {
        userId: decoded.userId,
        date: attendanceDate,
        startTime,
        endTime,
        attendanceType: evaluation.attendanceType,
        late: evaluation.late,
        status: "pending",
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      attendance: evaluation,
    });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
