import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { Types } from "mongoose";

interface TokenPayload {
  userId: string;
  role: "superAdmin" | "CXO/HR" | "techManager" | "employee" | "intern";
}

interface PopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  role: string;
  employeeId?: string;
}

interface AttendanceWithUser {
  date: Date;
  status: string;
  userId: PopulatedUser;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (decoded.role === "intern") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const dateFilter = searchParams.get("dateFilter");

    const userFilter: Record<string, unknown> = {};
    if (name) userFilter.firstName = { $regex: name, $options: "i" };
    if (role) userFilter.role = role;

    const users = Object.keys(userFilter).length
      ? await User.find(userFilter).select("_id")
      : [];

    const attendanceFilter: Record<string, unknown> = {};
    if (status) attendanceFilter.status = status;
    if (dateFilter)
      attendanceFilter.date = new Date(`${dateFilter}T00:00:00`);
    if (users.length)
      attendanceFilter.userId = { $in: users.map((u) => u._id) };

    const data = (await Attendance.find(attendanceFilter)
      .populate("userId", "firstName role employeeId")
      .sort({ date: -1 })) as AttendanceWithUser[];

    const csv =
      [
        ["Name", "Employee ID", "Role", "Date", "Day", "Status"],
        ...data.map((a) => {
          const d = new Date(a.date);
          return [
            a.userId.firstName,
            a.userId.employeeId ?? "",
            a.userId.role,
            d.toISOString().split("T")[0],
            d.toLocaleDateString("en-IN", { weekday: "long" }),
            a.status,
          ];
        }),
      ]
        .map((r) => r.map((v) => `"${v}"`).join(","))
        .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          "attachment; filename=attendance.csv",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "CSV export failed" },
      { status: 500 }
    );
  }
}
