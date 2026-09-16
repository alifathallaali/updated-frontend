import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  
  // الفحص المباشر عن أي كوكيز تحتوي على توكن التسجيل الخاص بـ Supabase
  const hasSupabaseAuth = allCookies.some((cookie) =>
    cookie.name.startsWith("sb-") &&
    (cookie.name.includes("-auth-token") || cookie.name.includes("auth-token"))
  );

  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";

  // 1. إذا كان المستخدم غير مسجل ويحاول فتح أي صفحة محمية -> توجيهه لصفحة Login
  if (!hasSupabaseAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. إذا كان المستخدم مسجلاً بالفعل ويفتح صفحة Login -> توجيهه للـ Dashboard
  if (hasSupabaseAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


