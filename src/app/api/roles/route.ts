import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";

export async function GET() {
  await dbConnect();
  const roles = await Role.find().select("_id name");
  return NextResponse.json(roles);
}
