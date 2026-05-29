import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const protectedRoutes = ["/admin", "/dashboard"];

// Routes that should redirect to /admin if already authenticated
const authRoutes = ["/signin", "/signup"];

export default async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // If the user is NOT logged in and tries to access a protected route → redirect to /signin
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // If the user IS logged in and visits an auth page → redirect to their respective dashboard
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    if (user.email?.toLowerCase() === "raedax77@gmail.com") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Prevent standard users from accessing the admin dashboard
  if (user && pathname.startsWith("/admin") && user.email?.toLowerCase() !== "raedax77@gmail.com") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Prevent admin from accessing the standard user dashboard
  if (user && pathname.startsWith("/dashboard") && user.email?.toLowerCase() === "raedax77@gmail.com") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
