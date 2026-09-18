import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  const isLoginPage = req.nextUrl.pathname === "/login";

  // 1. Unauthenticated users trying to access protected routes -> Redirect to Login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Authenticated users trying to access Login page -> Redirect to Dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (if handled separately)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
