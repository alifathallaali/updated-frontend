"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiFetch, ApiError } from "@/lib/api";

type Workspace = {
  id: number;
  name: string;
  organization: string | null;
  role: string;
};

const useCases = [
  ["↗", "Achievement Sheet", "Review actual performance against targets", "ورقة الإنجاز", "راجع الأداء الفعلي مقابل الأهداف"],
  ["◒", "Forecasting", "Build scenarios from your commercial data", "التنبؤ", "أنشئ سيناريوهات من بياناتك التجارية"],
  ["◎", "Target Setting", "Set informed targets by brand and market", "تحديد الأهداف", "حدد أهدافًا مدروسة لكل علامة وسوق"],
  ["✦", "Brand Plan", "Turn insights into a focused brand plan", "خطة العلامة التجارية", "حوّل الرؤى إلى خطة مركزة للعلامة"],
  ["▤", "Business Review", "Prepare a clear executive review", "مراجعة الأعمال", "جهّز مراجعة تنفيذية واضحة"],
  ["⌁", "GTM Strategy", "Shape your go-to-market decisions", "استراتيجية دخول السوق", "صمّم قرارات دخول السوق"],
];

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [prompt, setPrompt] = useState("");
  const [selectedCase, setSelectedCase] = useState("");

  const t = useMemo(
    () => (en: string, ar: string) => (lang === "ar" ? ar : en),
    [lang]
  );

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pharmalens-lang");
    if (stored === "ar") setLang("ar");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setEmail(session.user?.email ?? null);
      loadWorkspaces();
    });
  }, []);

  async function loadWorkspaces() {
    try {
      const data = await apiFetch<Workspace[]>("/api/workspaces");
      setWorkspaces(data);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : t("Could not reach the PharmaLens API.", "تعذر الاتصال بواجهة PharmaLens.")
      );
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiFetch("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      await loadWorkspaces();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : t("Could not create the workspace.", "تعذر إنشاء مساحة العمل.")
      );
    } finally {
      setCreating(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function chooseCase(title: string) {
    setSelectedCase(title);
    setPrompt(title + ": ");
    document.getElementById("analysis-prompt")?.focus();
  }

  // Prevents HTML/hydration mismatch during login transitions
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-500">Loading PharmaLens AI…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pt-10">
      <div className="mx-auto max-w-[1160px]">
        <header className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-blue-600">
              {t("COMMERCIAL INTELLIGENCE WORKSPACE", "مساحة الذكاء التجاري")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("What are we analyzing today?", "ماذا نريد أن نحلل اليوم؟")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {t("Turn pharmaceutical commercial data into confident decisions.", "حوّل البيانات التجارية الدوائية إلى قرارات واثقة.")}
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button
              onClick={() => router.push("/copilot")}
              className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              ✦ {t("Ask Copilot", "اسأل المساعد")}
            </button>
            <button
              onClick={signOut}
              className="focus-ring rounded-xl p-2 text-slate-400 hover:bg-white"
              aria-label="Sign out"
            >
              ↗
            </button>
          </div>
        </header>

        <section className="app-card mt-9 overflow-hidden border-blue-100 shadow-[0_12px_40px_-20px_rgba(59,130,246,.35)]">
          <div className="p-5 sm:p-7">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">✦</span>
                {t("Start a new analysis", "ابدأ تحليلًا جديدًا")}
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800">
                {t("AI workspace", "مساحة AI")}
              </span>
            </div>
            <textarea
              id="analysis-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("Describe what you want to understand, compare, or decide...", "اكتب ما تريد فهمه أو مقارنته أو اتخاذ قرار بشأنه...")}
              className="focus-ring min-h-[124px] w-full resize-none rounded-xl border-0 bg-slate-50 p-4 text-base text-slate-800 outline-none placeholder:text-slate-400 dark:bg-slate-800/70 dark:text-white"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                ⌑ {t("Attach data", "إرفاق بيانات")}
              </button>
              <button className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                ◉ {t("Choose workflow", "اختر مسار العمل")}
              </button>
              <span className="flex-1" />
              <button
                onClick={() => router.push("/data-hub")}
                className="focus-ring rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                {t("Run analysis", "تشغيل التحليل")} <span className="ml-1">→</span>
              </button>
            </div>
          </div>
        </section>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">{t("Try a use case", "جرّب حالة استخدام")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("Start with a workflow built for commercial teams.", "ابدأ بمسار مصمم للفرق التجارية.")}
            </p>
          </div>
          <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            {t("View all workflows →", "عرض كل المسارات ←")}
          </Link>
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {useCases.map(([icon, en, enDesc, ar, arDesc]) => (
            <button
              key={en}
              onClick={() => chooseCase(en)}
              className={`app-card focus-ring group p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ${
                selectedCase === en ? "border-blue-400 ring-2 ring-blue-100" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-lg text-blue-600 transition group-hover:bg-blue-500 group-hover:text-white">
                  {icon}
                </span>
                <span className="text-slate-300 transition group-hover:text-blue-500">↗</span>
              </div>
              <h3 className="mt-5 font-bold">{t(en, ar)}</h3>
              <p className="mt-1.5 text-sm leading-5 text-slate-500">{t(enDesc, arDesc)}</p>
              <div className="mt-4 text-xs font-bold text-blue-600">{t("Use this →", "استخدم هذا ←")}</div>
            </button>
          ))}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="app-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">{t("Your workspaces", "مساحات العمل")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("Projects and analyses live here.", "هنا توجد مشاريعك وتحليلاتك.")}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                {workspaces?.length ?? 0}
              </span>
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            {workspaces === null && !error && (
              <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            )}
            {workspaces?.length === 0 && (
              <p className="mt-5 text-sm text-slate-500">
                {t("No workspaces yet. Create your first one below.", "لا توجد مساحات عمل بعد. أنشئ أول مساحة أدناه.")}
              </p>
            )}
            {workspaces && workspaces.length > 0 && (
              <div className="mt-4 space-y-2">
                {workspaces.slice(0, 4).map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800">
                    <div>
                      <div className="text-sm font-semibold">{w.name}</div>
                      <div className="text-xs text-slate-500">
                        {w.organization || t("Commercial workspace", "مساحة تجارية")}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">{w.role}</span>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleCreate} className="mt-5 flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("New workspace name", "اسم مساحة جديدة")}
                className="focus-ring min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                disabled={creating}
                className="focus-ring rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50 dark:bg-blue-500"
              >
                {creating ? "…" : t("Create", "إنشاء")}
              </button>
            </form>
          </div>

          <div className="soft-card p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-600">✦</span>
              <div>
                <h2 className="font-bold">{t("Decision signals", "إشارات القرار")}</h2>
                <p className="text-xs text-slate-500">{t("Your commercial pulse", "ملخصك التجاري")}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                <div className="text-xs text-slate-500">{t("Active analyses", "تحليلات نشطة")}</div>
                <div className="mt-2 text-2xl font-bold">—</div>
              </div>
              <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                <div className="text-xs text-slate-500">{t("Reports ready", "تقارير جاهزة")}</div>
                <div className="mt-2 text-2xl font-bold">—</div>
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              {t("Connect your first dataset to unlock performance signals and recommendations.", "اربط أول مجموعة بيانات لعرض مؤشرات الأداء والتوصيات.")}
            </p>
            <Link href="/data-hub" className="mt-4 inline-block text-sm font-bold text-blue-600">
              {t("Go to Data Hub →", "اذهب إلى مركز البيانات ←")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
