import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Supabase SSR Client Initialize Karein
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Encrypted HTTP-Only Cookie se Session Read Karein (Client Tampering Safe)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // -------------------------------------------------------------
  // FEATURE 1: Main Domain (`otterleo.in/`) Redirect Logic
  // -------------------------------------------------------------
  if (path === "/" || path === "/login" || path === "/signup") {
    if (user) {
      // User already logged in hai -> Direct /dashboard par bhej do
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // -------------------------------------------------------------
  // FEATURE 2: Security & ID Hijack Protection
  // Protected Routes Check (/dashboard, /challenges, /profile, etc.)
  // -------------------------------------------------------------
  const protectedRoutes = [
    "/dashboard",
    "/challenges",
    "/practice",
    "/grid-maker",
    "/scan",
    "/leaderboard",
    "/learning-path",
    "/achievements",
    "/profile",
    "/settings",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    // Bina Auth waale ko Login page par bhejo
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

// Global Matcher Configuration
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