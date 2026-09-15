import { supabase } from "./supabaseClient";

// 1. دالة تنظيف الرابط الرئيسي لضمان إرجاع النطاق الرئيسي فقط بدون تكرارات
function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  let url = "https://backend-pharmalens-ai.onrender.com";

  if (envUrl && envUrl !== "undefined" && envUrl.trim() !== "") {
    url = envUrl.trim();
  }

  // إزالة أي سلاش في النهاية
  url = url.replace(/\/+$/, "");

  // إذا كان المتغير يحتوي بالخطأ على /api/workspaces أو /api في نهايته، قم بإزالتها لمنع التكرار
  url = url.replace(/\/api\/workspaces\/?$/, "");
  url = url.replace(/\/api\/?$/, "");

  return url;
}

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  // تركيب المسار ليكون https://backend-pharmalens-ai.onrender.com/api/workspaces مرة واحدة فقط
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${formattedPath}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.detail || body.message || `Request failed (${response.status})`,
      response.status
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
