import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export async function GET(req: Request) {
  try {
    await dbConnect();

    /* ---------- AUTH ---------- */
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    /* ---------- YEAR (IMPORTANT) ---------- */
    const { searchParams } = new URL(req.url);
    const selectedYear =
      Number(searchParams.get("year")) || new Date().getFullYear();

    const yearStart = new Date(`${selectedYear}-01-01`);
    const yearEnd = new Date(`${selectedYear + 1}-01-01`);

    /* ---------- TOTAL USERS ---------- */
    const totalUsers = await User.countDocuments();

    /* ---------- ROLE-WISE TOTAL USERS ---------- */
    const roleWise = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    /* ---------- MONTHLY USER SIGNUPS (YEAR-AWARE) ---------- */
    const userMonthlyRaw = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: yearStart,
            $lt: yearEnd,
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
    ]);

    const monthlySignups = MONTHS.map((month, index) => {
      const found = userMonthlyRaw.find(
        (m) => m._id.month === index + 1
      );
      return {
        month,
        users: found ? found.users : 0,
      };
    });

    /* ---------- MONTHLY ATTENDANCE (YEAR + STATUS) ---------- */
    const attendanceMonthlyRaw = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: yearStart,
            $lt: yearEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          stats: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyAttendance = MONTHS.map((month, index) => {
      const found = attendanceMonthlyRaw.find(
        (m) => m._id === index + 1
      );

      const row: Record<string, number | string> = {
        month,
        approved: 0,
        rejected: 0,
        pending: 0,
      };

      found?.stats.forEach(
        (s: { status: "approved" | "rejected" | "pending"; count: number }) => {
          row[s.status] = s.count;
        }
      );

      return row;
    });

    /* ---------- USERS LIST (OPTIONAL / MODAL) ---------- */
    const usersByRole = await User.find()
      .select("firstName lastName email role employeeId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      year: selectedYear,
      totalUsers,
      roleWise,
      monthlySignups,
      monthlyAttendance,
      usersByRole,
      growth: "+19%",
      activeSessions: Math.floor(totalUsers * 0.8),
    });

  } catch (error) {
    console.error("❌ Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
