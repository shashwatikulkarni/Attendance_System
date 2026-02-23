import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ---------------- PUBLIC ROUTES ---------------- */
  if (
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||       // ✅ allow reset page
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout") ||
    pathname.startsWith("/api/forgot-password") ||
    pathname.startsWith("/api/reset-password")      // ✅ allow reset API
  ) {
    return NextResponse.next();
  }

  /* ---------------- PROTECTED API ROUTES ---------------- */
  if (pathname.startsWith("/api")) {
    const token = req.cookies.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  /* ---------------- PROTECTED PAGE ROUTES ---------------- */
  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
