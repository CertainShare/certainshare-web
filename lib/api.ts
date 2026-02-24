// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

import { setClientBillingStatus } from "./billingGate";

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
    // If token is invalid/expired/revoked, force logout
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    const message = data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  // ✅ Store billing status if backend included it
  if (typeof window !== "undefined" && data) {
    const hasAccountState = data.account_state !== undefined;
    const hasOverLimit = data.over_limit !== undefined;

    if (hasAccountState || hasOverLimit) {
      setClientBillingStatus(data);
    }
  }

  return data;
}