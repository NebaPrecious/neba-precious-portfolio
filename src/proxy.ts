import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for /admin: if no session cookie is present, redirect to
 * the login page before rendering anything. This only checks the cookie's
 * presence — every admin page, action and route handler still validates the
 * session against the database via `requireAdmin()`.
 */
const COOKIE_NAMES = ["__Host-np_session", "np_session"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
