import { apiFetch } from "@/lib/api";

export type ProductDefinition = { id: string; name: string; domain: string; description: string; requiredInputs: string[]; dependencies: string[]; status: string };
export type ProductRun = { id?: number; product_id?: string; status: string; summary?: string; metrics?: Record<string, unknown>; evidence?: Array<Record<string, unknown>>; warnings?: string[]; confidence?: Record<string, unknown>; source?: Record<string, unknown> };
export type Report = { id: number; title: string; report_type?: string; created_at?: string; createdAt?: string; downloadPath?: string };
export type CopilotMessage = { id?: number; role: "user" | "assistant"; content: string; created_at?: string };
export type AchievementResult = { status: string; reason?: string; missing?: string[]; availableColumns?: string[]; summary?: Record<string, unknown>; byProduct?: Array<Record<string, unknown>>; byTerritory?: Array<Record<string, unknown>>; byRepresentative?: Array<Record<string, unknown>>; provenance?: Record<string, unknown> };
export type DatasetRecord = { id: number; name: string; status: string; latestVersionId?: number; version?: { id: number; versionNumber: number; fileName: string; status: string; rowCount?: number }; quality?: { qualityScore: number; criticalErrors: string[]; warnings: string[] } | null };

export const pharmaApi = {
  catalog: () => apiFetch<ProductDefinition[]>("/api/products/catalog"),
  runs: (workspaceId: number) => apiFetch<ProductRun[]>(`/api/product-runs?workspace_id=${workspaceId}`),
  runFromDatasetVersion: (body: { product_id: string; workspace_id: number; dataset_version_id: number; filters?: Record<string, unknown> }) => apiFetch<ProductRun>("/api/products/run-from-dataset-version", { method: "POST", body: JSON.stringify(body) }),
  runRows: (body: { product_id: string; workspace_id: number; rows: Record<string, unknown>[]; filters?: Record<string, unknown> }) => apiFetch<ProductRun>("/api/products/run", { method: "POST", body: JSON.stringify(body) }),
  files: (workspaceId: number) => apiFetch<Array<Record<string, unknown>>>(`/api/files?workspace_id=${workspaceId}`),
  reports: (workspaceId: number) => apiFetch<Report[]>(`/api/reports?workspace_id=${workspaceId}`),
  createReport: (body: { workspace_id: number; run_id: number }, format: "decision" | "pdf" | "pptx") => apiFetch<{ id: number; title: string; downloadPath: string }>(`/api/reports/${format === "pdf" ? "pdf-from-run" : format === "pptx" ? "pptx-from-run" : "from-run"}`, { method: "POST", body: JSON.stringify(body) }),
  copilotHistory: (workspaceId: number) => apiFetch<CopilotMessage[]>(`/api/copilot/history?workspace_id=${workspaceId}`),
  askCopilot: (workspace_id: number, message: string, context?: { data_context?: string; analysis_type?: string; workspace?: string; filters?: Record<string, unknown> }) => apiFetch<{ content: string; reply?: string; status?: string; provider_used?: string; fallback_used?: boolean }>("/api/copilot/ask", { method: "POST", body: JSON.stringify({ workspace_id, message, ...context }) }),
  appendCopilot: (body: { workspace_id: number; role: "user" | "assistant"; content: string }) => apiFetch<CopilotMessage>("/api/copilot/append", { method: "POST", body: JSON.stringify(body) }),
  notifications: () => apiFetch<Array<Record<string, unknown>>>("/api/notifications"),
  achievement: (body: { workspace_id: number; dataset_version_id: number; target_field?: string; actual_field?: string }) => apiFetch<AchievementResult>("/api/achievement/analyze", { method: "POST", body: JSON.stringify(body) }),
  dataDatasets: (workspaceId: number) => apiFetch<DatasetRecord[]>(`/api/data/datasets?workspace_id=${workspaceId}`),
  dataProvenance: (datasetId: number) => apiFetch<Record<string, unknown>>(`/api/data/datasets/${datasetId}/provenance`),
};
