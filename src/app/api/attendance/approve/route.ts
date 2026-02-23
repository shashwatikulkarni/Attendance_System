import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Attendance, {
  AttendanceDocument,
} from "@/models/Attendance";
import User, { IUser } from "@/models/User";
import { Types } from "mongoose";

/* ================= ROLE TYPE ================= */

type Role =
  | "superAdmin"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

interface TokenPayload {
  userId: string;
  role: Role;
}

/* ================= ROLE HIERARCHY ================= */

const ROLE_HIERARCHY: Record<Role, Role[]> = {
  superAdmin: ["CXO/HR", "techManager", "employee", "intern"],
  "CXO/HR": ["techManager", "employee", "intern"],
  techManager: ["employee", "intern"],
  employee: ["intern"],
  intern: [],
};

export const dynamic = "force-dynamic";

/* ============================ GET ==================== */

export async function GET(req: Request) {
  try {
    await dbConnect();

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json([], { status: 401 });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    const allowedRoles = ROLE_HIERARCHY[decoded.role];

    // ❌ Intern cannot access approval list
    if (allowedRoles.length === 0) {
      return NextResponse.json([], { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    /* ================= USER FILTER ================= */

    const userFilter: {
      role: { $in: Role[] };
      firstName?: { $regex: string; $options: string };
    } = {
      role: { $in: allowedRoles },
    };

    if (role && role !== "all") {
      userFilter.role = { $in: [role as Role] };
    }

    if (name) {
      userFilter.firstName = {
        $regex: name,
        $options: "i",
      };
    }

    const users = await User.find(userFilter).select("_id");

    /* ================= ATTENDANCE FILTER ================= */
const attendanceFilter: {
  userId: { $in: Types.ObjectId[] };
  status?: AttendanceDocument["status"];
  date?: Date;
} = {
  userId: {
    $in: users.map((u) => u._id as Types.ObjectId),
  },
};




    if (status && status !== "all") {
      attendanceFilter.status =
        status as AttendanceDocument["status"];
    }

    if (date) {
      const selectedDate = new Date(`${date}T00:00:00`);
      selectedDate.setHours(0, 0, 0, 0);
      attendanceFilter.date = selectedDate;
    }

    const records = await Attendance.find(attendanceFilter)
      .populate("userId", "firstName lastName role")
      .populate("approvedBy", "firstName lastName role")
      .sort({ createdAt: -1 });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Approve GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

/* =================== POST ======================= */

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
    ) as TokenPayload;

    const allowedRoles = ROLE_HIERARCHY[decoded.role];

    if (allowedRoles.length === 0) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    /* ---------- LOAD ATTENDANCE ---------- */

    const attendance = await Attendance.findById(id).populate(
      "userId",
      "role"
    );

    if (!attendance || !attendance.userId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

const targetRole = (attendance.userId as IUser).role;

if (!allowedRoles.includes(targetRole as Role)) {
  return NextResponse.json(
    { error: "Not allowed to approve this role" },
    { status: 403 }
  );
}

    attendance.status =
      status as AttendanceDocument["status"];

    attendance.approvedBy = new Types.ObjectId(
      decoded.userId
    );

    await attendance.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve POST error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
