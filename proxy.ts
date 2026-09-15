import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected Routes List (Jahan unverified/unauthenticated user nahi ja sakta)
  const protectedRoutes = [
    "/dashboard",
    "/scan",
    "/challenges",
    "/leaderboard",
    "/learning-path",
    "/achievements",
    "/profile",
    "/settings"
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 1. Agar User Logged in NAHI hai aur kisi Protected Page par jaane ki koshish kare -> Redirect to /login
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Agar User Pehle se Logged in hai aur Login/Signup page kholne ki koshish kare -> Redirect to /dashboard
  if (user && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",
    "/challenges/:path*",
    "/leaderboard/:path*",
    "/learning-path/:path*",
    "/achievements/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};