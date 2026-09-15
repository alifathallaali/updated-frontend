import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get("sb-access-token")?.value;
  const isLoginPage = req.nextUrl.pathname === "/login";

  // تحويل المستخدم لصفحة Login إذا لم يكن لديه Session
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // تحويل المستخدم المسجل من صفحة Login إلى الصفحة الرئيسية مباشرة
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
