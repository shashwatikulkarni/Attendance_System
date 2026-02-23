import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
};

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const { role, email, firstName, lastName } = decoded;

    let users;

    /* ✅ SUPERADMIN & CXOHR SEE ALL */
    if (role === "superadmin" || role === "cxohr") {
      users = await User.find().select("-password");
    }

    /* ✅ TECHMANAGER SEE THEIR TEAM */
    else if (role === "techmanager") {
      const managerName = `${firstName} ${lastName}`;
      users = await User.find({ managerName }).select("-password");
    }

    /* ✅ OTHERS SEE ONLY THEMSELVES */
    else {
      users = await User.find({ email }).select("-password");
    }

    return NextResponse.json(users);

  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
