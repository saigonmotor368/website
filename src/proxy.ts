import { NextRequest, NextResponse } from "next/server";

function expired(token: string) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return !payload.exp || payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

function loginRedirect(request: NextRequest, isSubdomain: boolean) {
  const loginPath = "/dang-nhap-noi-bo";
  const url = isSubdomain
    ? new URL(loginPath, request.url)
    : new URL(loginPath, request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isSubdomain = host.startsWith("quanly.") || host.includes("quanly-");
  const pathname = request.nextUrl.pathname;

  // Convenience redirect from /quan-ly to /quanly
  if (pathname.startsWith("/quan-ly")) {
    const target = pathname.replace(/^\/quan-ly/, "/quanly");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If host is marketing domain and accessing /quanly in production, redirect to subdomain
  if (
    process.env.NODE_ENV === "production" &&
    !isSubdomain &&
    host.includes("saigonmotor.vn") &&
    pathname.startsWith("/quanly")
  ) {
    const subUrl = new URL(pathname, "https://quanly.saigonmotor.vn");
    return NextResponse.redirect(subUrl, { status: 307 });
  }

  // If on subdomain and root path, rewrite to /quanly dashboard
  if (isSubdomain && pathname === "/") {
    const dashboardUrl = new URL("/quanly", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If not accessing internal protected routes on standard domain, pass through
  const isProtectedRoute =
    pathname.startsWith("/quanly") ||
    isSubdomain;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Auth verification
  const access = request.cookies.get("sgm_staff_access")?.value;
  const refresh = request.cookies.get("sgm_staff_refresh")?.value;

  if (access && !expired(access)) {
    const res = NextResponse.next();
    if (pathname.startsWith("/quanly")) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return res;
  }

  if (!refresh) {
    return loginRedirect(request, isSubdomain);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return loginRedirect(request, isSubdomain);

  try {
    const tokenResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!tokenResponse.ok) return loginRedirect(request, isSubdomain);

    const session = await tokenResponse.json();
    const response = NextResponse.next();
    const secure = process.env.NODE_ENV === "production";

    response.cookies.set("sgm_staff_access", session.access_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: session.expires_in,
    });
    response.cookies.set("sgm_staff_refresh", session.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (pathname.startsWith("/quanly")) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
  } catch {
    return loginRedirect(request, isSubdomain);
  }
}

export const config = {
  matcher: [
    "/",
    "/quanly/:path*",
    "/quan-ly/:path*",
  ],
};
