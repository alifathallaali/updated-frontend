"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setStatusMsg({ text: error.message, type: "error" });
        setLoading(false);
        return;
      }

      if (data?.session) {
        // 1. Manually set cookie so middleware can read it immediately
        const maxAge = data.session.expires_in || 3600;
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

        // 2. Show success banner
        setStatusMsg({
          text: `Logged in successfully! Redirecting...`,
          type: "success",
        });

        // 3. Force hard browser navigation to trigger middleware refresh
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      } else {
        setStatusMsg({
          text: "Authentication succeeded, but no session was returned.",
          type: "error",
        });
        setLoading(false);
      }
    } catch (err: any) {
      setStatusMsg({
        text: err?.message || "An unexpected error occurred. Please try again.",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue your commercial work.</p>

        {statusMsg && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm font-medium ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
