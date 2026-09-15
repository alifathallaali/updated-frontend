"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? "/dashboard" : "/login");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink/60">Loading PharmaLens AI…</p>
    </main>
  );
}
