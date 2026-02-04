// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in .env.local");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}