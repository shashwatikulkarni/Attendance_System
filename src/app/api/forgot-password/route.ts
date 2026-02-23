import { NextResponse } from "next/server";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 🔐 Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
  from: `"HR Portal" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Reset Your Password - HR Portal",
  html: `
    <h2>Hello ${user.firstName},</h2>

    <p>We received a request to reset your password.</p>

    <p>If you did not request this, please ignore this email.</p>

    <p>Click the button below to reset your password:</p>

    <a href="${resetLink}" 
      style="
        display:inline-block;
        padding:12px 20px;
        background:#6366f1;
        color:white;
        text-decoration:none;
        border-radius:6px;
        font-weight:600;
      ">
      Reset Password
    </a>

    <p style="margin-top:20px;">
      This link will expire in 15 minutes.
    </p>

    <br/>
    <p>Regards,<br/>HR Portal Team</p>
  `,
});


    return NextResponse.json({
      message: "Reset email sent successfully",
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
