import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose, { Types } from "mongoose";

interface TokenPayload {
  userId: string;
  role: string;
}

const ROLE_HIERARCHY: Record<string, string[]> = {
  superAdmin: ["HR", "CXO/HR", "techManager", "employee", "intern"],
  HR: ["techManager", "employee", "intern"],
  "CXO/HR": ["techManager", "employee", "intern"],
  techManager: ["employee", "intern"],
  employee: ["intern"],
  intern: [],
};

/* ================= PUT ================= */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

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

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const allowedRoles = ROLE_HIERARCHY[decoded.role] || [];

    if (!allowedRoles.includes(targetUser.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    /* 🔥 If managerEmpId is sent, convert to managerId */
    let managerId: Types.ObjectId | null = targetUser.managerId || null;

    if (body.managerEmpId) {
      const manager = await User.findOne({
        employeeId: body.managerEmpId,
      });

      if (!manager) {
        return NextResponse.json(
          { error: "Manager not found" },
          { status: 400 }
        );
      }

      managerId = manager._id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        role: body.role,
        mobile: body.mobile,
        address: body.address,
        emergencyContact: body.emergencyContact,
        managerId, // ✅ correct field
        resume: body.resume,       // ✅ added
        photoId: body.photoId,     // ✅ added
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

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

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const allowedRoles = ROLE_HIERARCHY[decoded.role] || [];

    if (!allowedRoles.includes(targetUser.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // await User.findByIdAndDelete(id);

    await User.findByIdAndUpdate(id, {
  isDeleted: true,
});

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
