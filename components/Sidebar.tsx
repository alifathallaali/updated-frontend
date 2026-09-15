"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primary = [
  ["⌂", "Home", "الرئيسية", "/dashboard"],
  ["◒", "Analyze", "تحليل", "/analyze"],
  ["↗", "Achievement", "الإنجاز", "/achievement"],
  ["✦", "AI Copilot", "المساعد الذكي", "/copilot"],
  ["⌕", "Search", "بحث", "/search"],
];
const workspace = [
  ["▣", "Projects", "المشاريع", "/projects"],
  ["⌑", "Files", "الملفات", "/data-hub"],
  ["◫", "Dashboards", "لوحات المعلومات", "/dashboards"],
  ["▤", "Reports", "التقارير", "/reports"],
  ["✉", "Newsletter", "النشرة البريدية", "/newsletter"],
];
const workflows: [string, string, string[][]][] = [
  ["Performance & analytics", "الأداء والتحليلات", [["Achievement Sheet", "ورقة الإنجاز"], ["Business Review", "مراجعة الأعمال"]]],
  ["Planning & forecasting", "التخطيط والتنبؤ", [["Target Setting", "تحديد الأهداف"], ["Forecasting", "التنبؤ"], ["Activity Planning", "تخطيط الأنشطة"]]],
  ["Brand & portfolio", "العلامة التجارية والمحفظة", [["Brand Plan", "خطة العلامة التجارية"], ["GTM Strategy", "استراتيجية دخول السوق"], ["SFE Strategy", "استراتيجية كفاءة القوة البيعية"]]],
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const storedLang = (localStorage.getItem("pharmalens-lang") as "en" | "ar" | null) || "en";
    const storedTheme = (localStorage.getItem("pharmalens-theme") as "light" | "dark" | null) || "light";
    setLang(storedLang); setTheme(storedTheme);
    document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = storedLang;
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);
  function changeLang(next: "en" | "ar") { setLang(next); localStorage.setItem("pharmalens-lang", next); document.documentElement.dir = next === "ar" ? "rtl" : "ltr"; document.documentElement.lang = next; }
  function toggleTheme() { const next = theme === "light" ? "dark" : "light"; setTheme(next); localStorage.setItem("pharmalens-theme", next); document.documentElement.classList.toggle("dark", next === "dark"); }
  const label = (en: string, ar: string) => lang === "ar" ? ar : en;
  const isActive = (href: string) => pathname === href;
  const Item = ({ item, compact = false }: { item: string[]; compact?: boolean }) => <Link href={item[3] || "#"} onClick={() => setOpen(false)} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive(item[3]) ? "bg-blue-500 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800"} ${compact ? "text-xs" : ""}`}><span className="w-5 text-center text-base">{item[0]}</span><span>{label(item[1], item[2])}</span></Link>;

  return <>
    <button aria-label="Open navigation" className="focus-ring fixed left-4 top-4 z-30 rounded-xl border bg-white p-2.5 text-slate-700 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white" onClick={() => setOpen(true)}>☰</button>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r bg-[#f3f6fa] px-4 py-5 transition-transform dark:border-slate-800 dark:bg-[#111c31] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 text-xl text-white shadow-sm">✦</div><div><div className="text-base font-bold tracking-tight">PharmaLens</div><div className="text-[10px] font-medium text-slate-400">COMMERCIAL INTELLIGENCE</div></div></div>
        <button className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-white lg:hidden" onClick={() => setOpen(false)}>×</button>
      </div>
      <Link href="/dashboard" onClick={() => setOpen(false)} className="focus-ring mt-7 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"><span className="text-lg">＋</span>{label("New Analysis", "تحليل جديد")}</Link>
      <nav className="mt-6 space-y-1">{primary.map((x) => <Item key={x[1]} item={x} />)}</nav>
      <div className="my-5 border-t dark:border-slate-700" />
      <div className="eyebrow px-3">{label("Workspace", "مساحة العمل")}</div>
      <nav className="mt-2 space-y-1">{workspace.map((x) => <Item key={x[1]} item={x} />)}</nav>
      <button onClick={() => setExpanded(!expanded)} className="focus-ring eyebrow mt-6 flex w-full items-center justify-between px-3 text-left hover:text-blue-600"><span>{label("Commercial workflows", "مسارات العمل التجارية")}</span><span className="text-base">{expanded ? "⌃" : "⌄"}</span></button>
      {expanded && <div className="mt-2 space-y-3">{workflows.map((group) => <div key={group[0]}><div className="px-3 pb-1 text-[11px] font-semibold text-slate-400">{label(group[0], group[1])}</div>{(group[2] as string[][]).map((x) => <Link key={x[0]} href="#" className="focus-ring block truncate rounded-lg px-3 py-1.5 pl-11 text-xs text-slate-500 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-800">{label(x[0], x[1])}</Link>)}</div>)}</div>}
      <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-800"><div className="flex items-start gap-2"><span className="text-blue-500">✦</span><div><div className="text-xs font-semibold">{label("AI Copilot is ready", "المساعد الذكي جاهز")}</div><p className="mt-1 text-[11px] leading-4 text-slate-500">{label("Ask questions across your commercial work.", "اسأل عن بياناتك وتحليلاتك التجارية.")}</p></div></div><Link href="/copilot" className="mt-2 block text-xs font-semibold text-blue-600">{label("Open Copilot →", "فتح المساعد ←")}</Link></div>
      <div className="mt-3 flex items-center justify-between rounded-xl px-2 py-2 text-xs text-slate-500"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">PL</div><div><div className="font-semibold text-slate-700 dark:text-slate-200">PharmaLens User</div><div>Free workspace</div></div></div><button onClick={toggleTheme} className="focus-ring rounded-lg p-2 hover:bg-white dark:hover:bg-slate-800" aria-label="Toggle theme">{theme === "light" ? "☾" : "☀"}</button></div>
      <div className="flex gap-1 px-2 pt-1 text-[11px] text-slate-400"><button className={lang === "en" ? "font-bold text-blue-600" : ""} onClick={() => changeLang("en")}>English</button><span>/</span><button className={lang === "ar" ? "font-bold text-blue-600" : ""} onClick={() => changeLang("ar")}>العربية</button></div>
    </aside>
  </>;
}
