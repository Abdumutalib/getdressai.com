import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/referrals", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!needsAuth) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token") ||
    request.cookies.has("getdressai_session");

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/referrals/:path*", "/admin/:path*"]
};
