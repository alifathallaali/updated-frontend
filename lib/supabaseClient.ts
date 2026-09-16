import { createClient } from "@supabase/supabase-js";

// قراءة المتغيرات البيئية مع استخدام قيم فحص افتراضية لمنع انهيار عملية البناء (Prerendering/Build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

// يدعم كلاً من المسميين الشائعين (PUBLISHABLE_KEY أو ANON_KEY)
const supabasePublishableKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "placeholder-anon-key";

// إظهار تحذير في بيئة التطوير والتشغيل فقط إذا كانت القيم الحقيقية مفقودة
if (
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
   (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) &&
  typeof window !== "undefined"
) {
  console.warn(
    "⚠️ Supabase env vars are missing — check your Vercel Environment Variables or .env.local (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
