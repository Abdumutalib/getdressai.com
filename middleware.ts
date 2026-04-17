import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/referrals", "/admin"];
const CANONICAL_HOST = "getdressai.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const needsAuth = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isPreviewHost = host.endsWith(".vercel.app") && host !== CANONICAL_HOST;

  const applyIndexingHeaders = (response: NextResponse) => {
    if (isPreviewHost) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      response.headers.set("Link", `<https://${CANONICAL_HOST}${pathname}>; rel="canonical"`);
    }

    return response;
  };

  if (!needsAuth) {
    return applyIndexingHeaders(NextResponse.next());
  }

  const hasSession =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token") ||
    request.cookies.has("getdressai_session");

  if (hasSession) {
    return applyIndexingHeaders(NextResponse.next());
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return applyIndexingHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?)$).*)"]
};
