import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/catalog", "/releases", "/tracks", "/health", "/import"];
const authRoutes = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If not configured, just pass through (dev mock mode) — no auth enforcement
  if (!url || !key || url.includes("YOUR_PROJECT")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        cookiesToSet.forEach(({ name, value }: { name: string; value: string }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthRoute = authRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Redirect unauthenticated users away from protected routes
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login/signup to dashboard
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
