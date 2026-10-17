import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Central authentication gate. Any route under the matcher below requires a
 * signed-in session; anonymous visitors are sent to the sign-in page with a
 * `callbackUrl` so they land back where they intended. Fine-grained role checks
 * stay in each page/action (they need the full RBAC matrix), but this keeps the
 * "must be logged in" behaviour consistent across the app.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: (process.env.NEXTAUTH_URL ?? "").startsWith("https://"),
  });

  if (token) return NextResponse.next();

  const signInUrl = new URL("/auth/signin", req.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
  );
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/gonit-doot/dashboard/:path*",
    "/gonit-doot/review/:path*",
    "/clubs/dashboard/:path*",
    "/clubs/register/:path*",
    "/problems/practice/:path*",
    "/problems/grading/:path*",
  ],
};
