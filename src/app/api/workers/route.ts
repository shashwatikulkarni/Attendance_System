import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import EmployeeManagerMapping from "@/models/EmployeeManagerMapping";

interface AuthPayload {
  userId: string;
  role: string;
}

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    let query: Record<string, unknown> = {};

    /* ================= ROLE LOGIC ================= */

    // ✅ SUPER ADMIN → sees everyone except himself
    if (decoded.role === "superAdmin") {
      query = { _id: { $ne: decoded.userId } };
    }

    // ✅ HR / CXO-HR → sees everyone except superAdmin
    else if (decoded.role === "HR" || decoded.role === "CXO/HR") {
      query = { role: { $ne: "superAdmin" } };
    }

    // ✅ TECH MANAGER / EMPLOYEE → only assigned people
    else if (
      decoded.role === "techManager" ||
      decoded.role === "employee"
    ) {
      const currentUser = await User.findById(decoded.userId);

      if (!currentUser) {
        return NextResponse.json([], { status: 200 });
      }

      // Find mappings where managerEmpId = current user's employeeId
      const mappings = await EmployeeManagerMapping.find({
        managerEmpId: currentUser.employeeId,
      });

      const assignedEmployeeIds = mappings.map(
        (m) => m.employeeEmpId
      );

      query = {
        employeeId: { $in: assignedEmployeeIds },
      };
    }

    // ✅ INTERN → sees nobody
    else {
      return NextResponse.json([]);
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("-password")
      .lean();

    return NextResponse.json(users);

  } catch (error) {
    console.error("Employees fetch error:", error);
    return NextResponse.json(

      { error: "Failed to fetch Employees" },
      { status: 500 }
    );
  }
}
