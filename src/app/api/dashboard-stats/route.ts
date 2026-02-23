import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

export async function GET() {
  await dbConnect();

  const totalUsers = await User.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeToday = await Attendance.countDocuments({
    date: { $gte: today },
    attendanceType: { $in: ["Full Day", "Half Day"] },
  });

  const pendingRequests = await Attendance.countDocuments({
    status: "Pending",
  });

  return NextResponse.json({
    totalUsers,
    activeToday,
    pendingRequests,
  });
}
