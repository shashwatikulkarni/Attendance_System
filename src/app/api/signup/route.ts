import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Counter from "@/models/Counter";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import EmployeeManagerMapping from "@/models/EmployeeManagerMapping";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type Role =
  | "superAdmin"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

interface AuthPayload {
  userId: string;
  role: Role;
}

const ROLE_MANAGER_ALLOWED: Record<Role, Role[]> = {
  superAdmin: [],
  "CXO/HR": ["superAdmin"],
  techManager: ["CXO/HR"],
  employee: ["techManager"],
  intern: ["employee"],
};

export async function POST(req: Request) {
  try {
    await dbConnect();

    /* ================= AUTH ================= */

    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    /* ================= FORM DATA ================= */

    const formData = await req.formData();

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const dob = String(formData.get("dob") || "");
    const role = String(formData.get("role") || "") as Role;
    const managerEmpId = String(formData.get("managerEmpId") || "").trim();

    const resumeFile = formData.get("resume") as File | null;
    const photoFile = formData.get("photoId") as File | null;

    if (!firstName || !lastName || !email || !dob || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );

    /* ================= MANAGER VALIDATION ================= */

    let managerId: Types.ObjectId | null = null;

    if (role !== "superAdmin") {
      if (!managerEmpId)
        return NextResponse.json(
          { error: "Manager required" },
          { status: 400 }
        );

      const manager = await User.findOne({
        employeeId: managerEmpId,
      });

      if (!manager)
        return NextResponse.json(
          { error: "Manager not found" },
          { status: 400 }
        );

      const allowedRoles = ROLE_MANAGER_ALLOWED[role];

      if (!allowedRoles.includes(manager.role as Role))
        return NextResponse.json(
          { error: "Invalid manager role" },
          { status: 400 }
        );

      managerId = manager._id;
    }

    /* ================= CREATE UPLOAD DIRECTORIES ================= */

    const resumeDir = path.join(process.cwd(), "public/uploads/resume");
    const photoDir = path.join(process.cwd(), "public/uploads/photoId");

    await mkdir(resumeDir, { recursive: true });
    await mkdir(photoDir, { recursive: true });

    /* ================= SAVE FILES ================= */

    let resumeUrl = "";
    let photoUrl = "";

    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `resume_${Date.now()}_${resumeFile.name}`;
      const filePath = path.join(resumeDir, fileName);

      await writeFile(filePath, buffer);

      // ✅ STORE PUBLIC URL (NOT SYSTEM PATH)
      resumeUrl = `/uploads/resume/${fileName}`;
    }

    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `photo_${Date.now()}_${photoFile.name}`;
      const filePath = path.join(photoDir, fileName);

      await writeFile(filePath, buffer);

      // ✅ STORE PUBLIC URL (NOT SYSTEM PATH)
      photoUrl = `/uploads/photoId/${fileName}`;
    }

    /* ================= GENERATE EMPLOYEE ID ================= */

    const counter = await Counter.findByIdAndUpdate(
      { _id: "employeeId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const employeeId = `EMP${counter.seq}`;

    const dobYear = new Date(dob).getFullYear();
    const rawPassword = `${dobYear}_${employeeId}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    /* ================= CREATE USER ================= */

    await User.create({
      firstName,
      lastName,
      email,
      dob: new Date(dob),
      role,
      employeeId,
      password: hashedPassword,
      managerId,
      createdBy: decoded.userId,
      resume: resumeUrl,
      photoId: photoUrl,
    });

    /* ================= CREATE MAPPING ================= */

    if (managerEmpId) {
      await EmployeeManagerMapping.create({
        employeeEmpId: employeeId,
        managerEmpId: managerEmpId,
        role,
      });
    }

    return NextResponse.json({
      message: "User created successfully",
      employeeId,
      defaultPassword: rawPassword,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
