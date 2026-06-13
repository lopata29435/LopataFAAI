import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight gate (Edge-safe, no jose/NextAuth): when login is enforced,
 * redirect to sign-in if there's no Auth.js session cookie. Real validation
 * happens server-side via auth() — a forged cookie just fails there.
 */
export function middleware(req: NextRequest) {
  if (process.env.AUTH_ENABLED !== "true") return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const hasSession =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = new URL("/api/auth/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
