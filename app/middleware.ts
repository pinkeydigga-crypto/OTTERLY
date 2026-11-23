import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

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
  // FEATURE 0: Admin Route Guard (/admin and subpaths)
  // -------------------------------------------------------------
  if (path === "/admin" || path.startsWith("/admin/")) {
    if (!user) {
      url.pathname = "/login";
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    const userEmail = (user.email || "").toLowerCase();
    const isAdmin =
      ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(userEmail);

    if (!isAdmin) {
      url.pathname = "/dashboard";
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // -------------------------------------------------------------
  // FEATURE 1: Main Domain (`otterleo.in/`) Redirect Logic
  // -------------------------------------------------------------
  if (path === "/" || path === "/login" || path === "/signup") {
    if (user) {
      url.pathname = "/dashboard";
      return applySecurityHeaders(NextResponse.redirect(url));
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
    url.pathname = "/login";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(response);
}

// Global Matcher Configuration
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};