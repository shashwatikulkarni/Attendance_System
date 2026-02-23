import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";

export async function POST() {
  await dbConnect();

  const roles = [
    { name: "Super Admin", code: "SUPER_ADMIN" },
    { name: "CXO / HR", code: "CXO_HR" },
    { name: "Tech Manager", code: "TECH_MANAGER" },
    { name: "Employee", code: "EMPLOYEE" },
    { name: "Intern", code: "INTERN" },
  ];

  for (const role of roles) {
    await Role.updateOne(
      { code: role.code },
      { $setOnInsert: role },
      { upsert: true }
    );
  }

  return NextResponse.json({ message: "Roles seeded successfully" });
}
