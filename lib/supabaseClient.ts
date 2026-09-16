import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

if (
  (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) &&
  typeof window !== "undefined"
) {
  console.warn(
    "⚠️ Supabase env vars are missing — check your Vercel Environment Variables or .env.local."
  );
}

// createBrowserClient تحفظ الجلسة في الكوكيز تلقائياً لكي يقرأها الـ Middleware
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
