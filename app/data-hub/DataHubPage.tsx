"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as tus from "tus-js-client";
import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api-backend";

type Workspace = { id: number; name: string };

async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("مش مسجل دخول — يرجى تسجيل الدخول أولاً");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${API_URL}${formattedPath}`, {
    ...options,
    headers,
  });
}

export function DataHubPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  
  // التحكم في مساحات العمل الديناميكية
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  
  const [datasets, setDatasets] = useState<any[]>([]);
  const [jobId, setJobId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const activeUpload = useRef<tus.Upload | null>(null);

  // 1. التحقق من تسجيل الدخول وجلب مساحات العمل المتاحة للمستخدم
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      loadWorkspaces();
    });
  }, []);

  // 2. تحميل مساحات العمل واختيار الأولى تلقائياً
  async function loadWorkspaces() {
    try {
      const res = await authenticatedFetch("/api/workspaces");
      if (res.ok) {
        const ws: Workspace[] = await res.json();
        setWorkspaces(ws);
        if (ws.length > 0) {
          setWorkspaceId(String(ws[0].id));
        } else {
          setError("لا توجد مساحات عمل (Workspaces) مرتبطة بحسابك. يرجى إنشاء مساحة أولاً من Dashboard.");
        }
      } else {
        setError("تعذر جلب مساحات العمل الخاصة بك.");
      }
    } catch (e: any) {
      setError(e.message || "خطأ في الاتصال بالسيرفر");
    }
  }

  // 3. جلب الداتاسيتس الخاصة بالـ Workspace المحدد
  async function loadDatasets() {
    if (!workspaceId) return;
    try {
      setError("");
      const res = await authenticatedFetch(`/api/v1/datasets?workspace_id=${workspaceId}`);
      if (res.ok) {
        setDatasets(await res.json());
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || `فشل جلب البيانات (${res.status})`);
      }
    } catch (e: any) {
      setError(e.message || "تعذر الاتصال بالخادم");
    }
  }

  useEffect(() => {
    if (workspaceId) {
      loadDatasets();
    }
  }, [workspaceId]);

  function resumableUpload(selected: File, upload: any) {
    return new Promise<void>((resolve, reject) => {
      const instance = new tus.Upload(selected, {
        endpoint: upload.endpoint,
        headers: { "x-signature": upload.token },
        metadata: {
          bucketName: upload.bucket,
          objectName: upload.key,
          fileName: selected.name,
          contentType: selected.type || "application/octet-stream",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        onProgress: (sent, total) => {
          const pct = Math.round((sent / total) * 100);
          setProgress(pct);
          setStatus(`رفع الملف إلى Supabase Storage — ${pct}%`);
        },
        onError: (e) => {
          activeUpload.current = null;
          reject(e);
        },
        onSuccess: () => {
          activeUpload.current = null;
          resolve();
        },
      });
      activeUpload.current = instance;
      instance.findPreviousUploads().then((previous) => {
        if (previous.length) instance.resumeFromPreviousUpload(previous[0]);
        instance.start();
      }).catch(reject);
    });
  }

  async function pollJob(id: number) {
    for (let i = 0; i < 900; i++) {
      const res = await authenticatedFetch(`/api/upload-sessions/${id}`);
      if (!res.ok) throw new Error("تعذر قراءة حالة المعالجة");
      const job = await res.json();
      setProgress(job.progress || 0);
      setStatus(`${job.stage || job.status} — ${job.progress || 0}%`);
      if (job.status === "ready") return;
      if (["failed", "cancelled"].includes(job.status)) {
        throw new Error(job.error || `المعالجة انتهت بحالة ${job.status}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error("المعالجة أخذت وقتًا أطول من المتوقع؛ يمكنك متابعة الحالة لاحقًا.");
  }

  async function handleUpload() {
    if (!file || !workspaceId) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      if (file.size > 500 * 1024 * 1024) throw new Error("الحد الأقصى لحجم الملف 500 MB");

      const idem = `${file.name}:${file.size}:${file.lastModified}`;
      setStatus("إنشاء جلسة رفع آمنة على Supabase...");

      const sessionRes = await authenticatedFetch("/api/upload-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          file_name: file.name,
          size_bytes: file.size,
          mime_type: file.type || null,
          idempotency_key: idem,
        }),
      });

      const session = await sessionRes.json().catch(() => ({}));
      if (!sessionRes.ok) throw new Error(session.detail || `إنشاء جلسة الرفع فشل (${sessionRes.status})`);

      setJobId(session.jobId);

      if (session.upload.method === "TUS") {
        await resumableUpload(file, session.upload);
      } else {
        const putRes = await fetch(session.upload.url, { method: "PUT", body: file });
        if (!putRes.ok) throw new Error(`رفع الملف فشل (${putRes.status})`);
      }

      setStatus("تأكيد الرفع وبدء المعالجة...");
      const completeRes = await authenticatedFetch("/api/upload-sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          job_id: session.jobId,
          dataset_name: file.name,
          source_type: "user_upload",
        }),
      });

      if (!completeRes.ok) throw new Error(`تأكيد الرفع فشل (${completeRes.status})`);

      await pollJob(session.jobId);
      setProgress(100);
      setStatus("✅ تم الرفع والتقييم بنجاح");
      await loadDatasets();
    } catch (e: any) {
      setError(e.message || String(e));
      setStatus("");
    } finally {
      activeUpload.current = null;
      setBusy(false);
    }
  }

  async function cancelUpload() {
    activeUpload.current?.abort(true);
    if (jobId) {
      await authenticatedFetch(`/api/upload-sessions/${jobId}/cancel`, { method: "POST" }).catch(() => {});
    }
    setBusy(false);
    setStatus("تم طلب إلغاء الرفع/المعالجة");
  }

  async function retryUpload() {
    if (!jobId) return;
    setBusy(true);
    setError("");
    try {
      await authenticatedFetch(`/api/upload-sessions/${jobId}/retry`, { method: "POST" });
      await pollJob(jobId);
      await loadDatasets();
      setStatus("✅ تمت إعادة المحاولة بنجاح");
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-300">📦 Data Hub</h1>
            <p className="mt-1 text-slate-400">
              Supabase resumable upload + multi-sheet Excel + background processing
            </p>
          </div>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">
            ← الرئيسية
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <label className="mb-2 block text-sm text-slate-400">اختر مساحة العمل (Workspace)</label>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-white outline-none focus:border-cyan-500"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (ID: {w.id})
              </option>
            ))}
          </select>

          <input
            type="file"
            accept=".xlsx,.xls,.csv,.parquet"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-white"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleUpload}
              disabled={busy || !file || !workspaceId}
              className="rounded-lg bg-cyan-600 px-6 py-2.5 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              🚀 ارفع وحلّل
            </button>
            {busy && (
              <button onClick={cancelUpload} className="rounded-lg border border-rose-700 px-5 py-2.5 text-rose-300">
                إلغاء
              </button>
            )}
            {!busy && error && jobId && (
              <button onClick={retryUpload} className="rounded-lg border border-amber-700 px-5 py-2.5 text-amber-300">
                إعادة المحاولة
              </button>
            )}
          </div>

          {busy && (
            <>
              <p className="mt-4 animate-pulse text-cyan-300">{status}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          )}

          {!busy && status && <p className="mt-4 font-semibold text-emerald-400">{status}</p>}
          {error && (
            <p className="mt-4 whitespace-pre-wrap break-all rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-400">
              {error}
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-500">
            الملف يذهب مباشرة إلى Supabase Storage على أجزاء 6MB، ثم يعالجه Worker خارج Request.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-200">📂 الداتاسيتس المسجلة</h2>
          {datasets.length === 0 ? (
            <p className="text-sm text-slate-500">مفيش داتاسيتس لسه — ارفع أول ملف!</p>
          ) : (
            <ul className="space-y-2">
              {datasets.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 p-3">
                  <span className="font-medium">{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {d.sourceType || d.source_type} • {d.status}
                    </span>
                    <Link
                      href={`/copilot?workspaceId=${workspaceId}&datasetId=${d.id}`}
                      className="text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      تحليل مع Copilot ←
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

export default DataHubPage;
