import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First update the Supabase session if configured
  const response = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  
  // Exclude static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Session checks using cookies
  const hasSession = request.cookies.has("bf_session");
  const userSessionCookie = request.cookies.get("bf_session")?.value;
  
  let userRole = "client";
  let userStatus = "active";
  
  if (userSessionCookie) {
    try {
      const session = JSON.parse(userSessionCookie);
      userRole = session.role || "client";
      userStatus = session.status || "active";
    } catch (e) {
      // Ignore
    }
  }

  // Deactivated user block
  if (hasSession && userStatus === "deactivated") {
    // If not already on login, redirect to login with error
    if (pathname !== "/login") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "deactivated");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("bf_session");
      return res;
    }
  }

  // Guard: Protect admin paths
  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userRole !== "admin") {
      // Forbidden: redirect clients to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Guard: Protect dashboard & settings & billing etc.
  const protectedPrefixes = [
    "/dashboard",
    "/project",
    "/tasks",
    "/files",
    "/approvals",
    "/billing",
    "/messages",
    "/meetings",
    "/tickets",
    "/contracts",
    "/settings",
    "/onboarding",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect from login/register if already authenticated
  if (pathname === "/login" || pathname === "/register") {
    if (hasSession && userStatus === "active") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
