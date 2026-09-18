"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Dataset = {
  id: string;
  name: string;
  category: string;
  size: string;
  updatedAt: string;
  status: "ready" | "processing" | "error";
};

const initialDatasets: Dataset[] = [
  {
    id: "ds-1",
    name: "Q3_Sales_Performance_KSA.xlsx",
    category: "Achievement Sheet",
    size: "2.4 MB",
    updatedAt: "2 hours ago",
    status: "ready",
  },
  {
    id: "ds-2",
    name: "Brand_Market_Share_2025.csv",
    category: "Market Share",
    size: "1.1 MB",
    updatedAt: "1 day ago",
    status: "ready",
  },
  {
    id: "ds-3",
    name: "Target_Settings_FY26.xlsx",
    category: "Target Setting",
    size: "850 KB",
    updatedAt: "3 days ago",
    status: "ready",
  },
];

export default function DataHubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");

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
        document.cookie = "sb-access-token=; path=/; max-age=0;";
        window.location.href = "/login";
      }
    });
  }, []);

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Simulate dataset processing delay
    setTimeout(() => {
      const newDataset: Dataset = {
        id: `ds-${Date.now()}`,
        name: file.name,
        category: "Custom Analysis",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        updatedAt: "Just now",
        status: "ready",
      };

      setDatasets((prev) => [newDataset, ...prev]);
      setUploading(false);
    }, 1200);
  }

  const filteredDatasets = datasets.filter((ds) =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-500">Loading Data Hub…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pt-10">
      <div className="mx-auto max-w-[1160px]">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-blue-600">
              {t("COMMERCIAL DATA ENGINE", "محرك البيانات التجارية")}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("Data Hub", "مركز البيانات")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("Upload, connect, and manage datasets for commercial insights.", "قم بتحميل وتوصيل وإدارة مجموعات البيانات للرؤى التجارية.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              ← {t("Back to Dashboard", "العودة للوحة التحكم")}
            </Link>
            <label className="focus-ring cursor-pointer rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600">
              {uploading ? t("Uploading...", "جاري التحميل...") : t("+ Upload Dataset", "+ تحميل مجموعة بيانات")}
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="app-card p-5">
            <span className="text-xs text-slate-500">{t("Total Datasets", "إجمالي البيانات")}</span>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{datasets.length}</div>
          </div>
          <div className="app-card p-5">
            <span className="text-xs text-slate-500">{t("Connected Sources", "المصادر المتصلة")}</span>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">2</div>
          </div>
          <div className="app-card p-5">
            <span className="text-xs text-slate-500">{t("Data Readiness Score", "جاهزية البيانات")}</span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">98%</div>
          </div>
        </section>

        {/* Search and Table Section */}
        <section className="app-card mt-8 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search datasets by name or category...", "ابحث عن المجموعات بالاسم أو الفئة...")}
              className="focus-ring w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={() => router.push("/copilot")}
              className="focus-ring rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-blue-500"
            >
              ✦ {t("Analyze Selected with Copilot", "تحليل المختار بواسطة المساعد")}
            </button>
          </div>

          {/* Dataset List */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-3">{t("Dataset Name", "اسم المجموعة")}</th>
                  <th className="pb-3">{t("Category", "الفئة")}</th>
                  <th className="pb-3">{t("Size", "الحجم")}</th>
                  <th className="pb-3">{t("Updated", "آخر تحديث")}</th>
                  <th className="pb-3">{t("Status", "الحالة")}</th>
                  <th className="pb-3 text-right">{t("Action", "الإجراء")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDatasets.map((ds) => (
                  <tr key={ds.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 font-semibold text-slate-900 dark:text-white">{ds.name}</td>
                    <td className="py-4">{ds.category}</td>
                    <td className="py-4 text-xs text-slate-400">{ds.size}</td>
                    <td className="py-4 text-xs text-slate-400">{ds.updatedAt}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {t("Ready", "جاهز")}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => router.push("/copilot")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        {t("Run Analysis →", "تشغيل التحليل ←")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
