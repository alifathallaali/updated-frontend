"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AnalyzePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = useMemo(
    () => (en: string, ar: string) => (lang === "ar" ? ar : en),
    [lang]
  );

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pharmalens-lang");
    if (stored === "ar") setLang("ar");

    // التحقق من وجود الجلسة وإدارة الكوكيز
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        document.cookie = "sb-access-token=; path=/; max-age=0;";
        window.location.href = "/login";
      }
    });
  }, []);

  // التعامل مع اختيار الملف
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  }

  // تشغيل عملية التحليل
  async function handleRunAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() && !file) {
      setError(
        t(
          "Please enter a prompt or attach a file to begin analysis.",
          "يرجى إدخال نص أو إرفاق ملف لبدء التحليل."
        )
      );
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 1. رفع الملف إلى Supabase Storage (اختياري)
      if (file) {
        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("datasets")
          .upload(fileName, file);

        if (uploadError) {
          // التعامل مع حالة عدم وجود Bucket مخصص
          console.warn("Storage upload skipped or failed:", uploadError.message);
        }
        setUploading(false);
      }

      // 2. محاكاة نتيجة تحليل الذكاء الاصطناعي (أو الربط مع API الخاص بك)
      setTimeout(() => {
        setAnalysisResult(
          t(
            "Analysis complete. Brand performance is currently tracking 14% above projected targets for Q3. Key growth driven by retail channels in KSA.",
            "تم التحليل بنجاح. أداء العلامة التجارية حالياً أعلى بنسبة 14% من الأهداف المحددة للربع الثالث. النمو الرئيسي مدفوع بقنوات التجزئة في المملكة العربية السعودية."
          )
        );
        setAnalyzing(false);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || t("An error occurred during analysis.", "حدث خطأ أثناء التحليل."));
      setAnalyzing(false);
      setUploading(false);
    }
  }

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
        {/* الهيدر */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-blue-600">
              {t("COMMERCIAL INTELLIGENCE ENGINE", "محرك الذكاء التجاري")}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("Run New Analysis", "تشغيل تحليل جديد")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t(
                "Upload commercial datasets and ask AI to generate actionable insights.",
                "قم بتحميل البيانات التجارية وطلب من الذكاء الاصطناعي استخراج الرؤى."
              )}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="focus-ring self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 sm:self-center dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            ← {t("Back to Dashboard", "العودة للوحة التحكم")}
          </Link>
        </header>

        {/* نموذج التحليل */}
        <form onSubmit={handleRunAnalysis} className="app-card mt-8 p-5 sm:p-7">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("Analysis Objective / Prompt", "هدف التحليل / التعليمات")}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t(
                  "E.g., Compare Q3 sales performance against market targets for KSA...",
                  "مثال: قارن أداء مبيعات الربع الثالث مقابل الأهداف المحددة للسوق..."
                )}
                className="focus-ring mt-2 min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
              />
            </div>

            {/* رفع الملف */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("Attach Commercial Data (Excel, CSV, JSON)", "إرفاق البيانات التجارية (Excel, CSV, JSON)")}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <label className="focus-ring cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  📁 {file ? file.name : t("Choose File", "اختر ملفاً")}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    {t("Remove", "إزالة")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={analyzing || uploading}
              className="focus-ring rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing
                ? t("Analyzing Data...", "جاري التحليل...")
                : uploading
                ? t("Uploading File...", "جاري رفع الملف...")
                : t("Run Analysis →", "تشغيل التحليل ←")}
            </button>
          </div>
        </form>

        {/* عرض النتيجة */}
        {analysisResult && (
          <section className="app-card mt-8 border-emerald-200 p-5 sm:p-7 dark:border-emerald-900">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
              <span>✦</span> {t("Analysis Results", "نتائج التحليل")}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {analysisResult}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => router.push("/copilot")}
                className="focus-ring rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-blue-500"
              >
                ✦ {t("Continue with Copilot", "المتابعة مع المساعد")}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
