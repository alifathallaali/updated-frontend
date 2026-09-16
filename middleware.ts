import { NextResponse } from "next";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // البحث عن أي كوكيز خاصة بـ Supabase تبدأ بـ sb-
  const allCookies = req.cookies.getAll();
  const hasSupabaseAuth = allCookies.some((cookie) =>
    cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
  );

  const isLoginPage = req.nextUrl.pathname === "/login";

  // 1. إذا لم يكن مسجلاً ويحاول فتح أي صفحة غير Login -> توجيهه لـ Login
  if (!hasSupabaseAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. إذا كان مسجلاً ويفتح صفحة Login -> توجيهه للـ Dashboard مباشرة
  if (hasSupabaseAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
