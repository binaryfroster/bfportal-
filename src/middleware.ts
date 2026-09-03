import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";
import { isStudioStaff, hasSignatoryAuthority } from "@/src/types";

// Routes strictly restricted to Internal Studio Staff (Founders, Engineers, PMs)
// Absolutely forbidden to all external clients
const STUDIO_ADMIN_ROUTES = [
  "/admin",
  "/proposals",
  "/client-360",
  "/credential-vault",
  "/api-keys",
];

// All protected portal routes requiring an authenticated active session
const PROTECTED_PORTAL_PREFIXES = [
  "/dashboard",
  "/activity",
  "/client-360",
  "/project",
  "/tasks",
  "/change-requests",
  "/files",
  "/approvals",
  "/billing",
  "/messages",
  "/meetings",
  "/tickets",
  "/maintenance",
  "/handover",
  "/contracts",
  "/credential-vault",
  "/analytics",
  "/knowledge-base",
  "/api-keys",
  "/feedback",
  "/integrations",
  "/settings",
  "/onboarding",
  "/admin",
  "/proposals",
];

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
    if (pathname !== "/login") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "deactivated");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("bf_session");
      return res;
    }
  }

  // Guard 1: Protect Studio-Only Operations (proposals, admin, vault, api-keys, client-360)
  const isStudioRoute = STUDIO_ADMIN_ROUTES.some((prefix) => pathname.startsWith(prefix));
  if (isStudioRoute) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isStudioStaff(userRole)) {
      // Security: Forbidden for all client tiers — redirect to client dashboard
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("error", "unauthorized_studio_route");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Guard 2: General Portal Authentication Guard
  const isProtected = PROTECTED_PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
