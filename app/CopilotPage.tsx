"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { pharmaApi, CopilotMessage } from "@/lib/pharmaApi";

type Workspace = { id: number; name: string };
const prompts = [
  "What is our Q3 target vs actual achievement by territory and retail channel?",
  "Analyze market share distribution and growth trajectory for key product lines in KSA.",
  "Identify top underperforming territories and provide a 12-month sales forecast.",
  "Which sales channels drove the highest growth variance this quarter?",
];

function CopilotContent() {
  const searchParams = useSearchParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const datasetId = Number(searchParams.get("datasetId") || 0) || undefined;
  const datasetVersionId = Number(searchParams.get("datasetVersionId") || 0) || undefined;
  const promptFromUrl = searchParams.get("prompt");

  useEffect(() => {
    apiFetch<Workspace[]>("/api/workspaces").then(ws => {
      setWorkspaces(ws);
      const requested = searchParams.get("workspaceId");
      setWorkspaceId(requested || (ws[0] ? String(ws[0].id) : ""));
    }).catch(e => setError(e?.message || JSON.stringify(e) || "Could not load workspaces."));
  }, [searchParams]);
  useEffect(() => { if (promptFromUrl) setInput(promptFromUrl); }, [promptFromUrl]);
  useEffect(() => { if (workspaceId) pharmaApi.copilotHistory(Number(workspaceId)).then(setMessages).catch(() => setMessages([])); }, [workspaceId]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function ask(e?: FormEvent) {
    e?.preventDefault();
    const message = input.trim();
    if (!message || !workspaceId || busy) return;
    setInput(""); setMessages(old => [...old, { role: "user", content: message }]); setBusy(true); setError("");
    try {
      const response = await pharmaApi.askCopilot(Number(workspaceId), message, { dataset_id: datasetId, dataset_version_id: datasetVersionId, workspace: workspaces.find(w => String(w.id) === workspaceId)?.name });
      setMessages(old => [...old, { role: "assistant", content: response.content }]);
    } catch (err: any) {
      const raw = err?.message ?? err;
      setError(typeof raw === "string" ? raw : JSON.stringify(raw) || "Copilot could not complete the request.");
    }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pt-10"><div className="mx-auto max-w-[1000px]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-violet-600">AI COPILOT</p><h1 className="mt-3 text-3xl font-bold">Your commercial thinking partner</h1><p className="mt-2 text-sm text-slate-500">Ask about your permitted workspace data. Answers come from the connected PharmaLens AI service.</p>{(datasetId || datasetVersionId) && <p className="mt-2 text-xs font-semibold text-blue-600">Attached dataset context: {datasetVersionId ? `version ${datasetVersionId}` : `dataset ${datasetId}`}</p>}</div><select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div><div className="app-card mt-8 flex min-h-[520px] flex-col overflow-hidden"><div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-700"><div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600">✦</div><div><div className="text-sm font-bold">PharmaLens Copilot</div><div className="text-xs text-slate-500">Context: {workspaces.find(w => String(w.id) === workspaceId)?.name || "Select a workspace"}</div></div><span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Connected</span></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.length === 0 && <div className="mx-auto max-w-xl py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-2xl text-violet-600">✦</div><h2 className="mt-4 text-xl font-bold">What would you like to understand?</h2><p className="mt-2 text-sm text-slate-500">Start with a question about your market, brands, customers, or decisions.</p><div className="mt-6 flex flex-wrap justify-center gap-2">{prompts.map(p => <button key={p} onClick={() => setInput(p)} className="focus-ring rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{p}</button>)}</div></div>}{messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "rounded-br-md bg-blue-500 text-white" : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}><div className="mb-1 text-[10px] font-bold uppercase opacity-60">{m.role === "user" ? "You" : "PharmaLens AI"}</div>{m.content}</div></div>)}{busy && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800">Analyzing your workspace<span className="animate-pulse">…</span></div></div>}<div ref={bottom} /></div>{error && <div className="mx-5 mb-3 whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}<form onSubmit={ask} className="border-t border-slate-100 p-4 dark:border-slate-700"><div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-violet-300 dark:border-slate-700 dark:bg-slate-800"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} rows={2} placeholder="Ask PharmaLens about your commercial data..." className="focus-ring min-h-[48px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none dark:text-white" /><button disabled={busy || !input.trim() || !workspaceId} className="focus-ring rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-40">Ask →</button></div><p className="mt-2 px-2 text-[11px] text-slate-400">AI outputs should be reviewed against evidence before business decisions.</p></form></div></div></div>;
}

export function CopilotPage() {
  return <Suspense fallback={<div className="min-h-screen p-8 text-sm text-slate-500">Loading Copilot…</div>}><CopilotContent /></Suspense>;
}
