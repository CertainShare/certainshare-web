// lib/billingGate.ts

export type AccountState = "active" | "grace" | "frozen";

export type BillingStatus = {
  account_state?: AccountState;
  grace_deadline?: string | null;
  frozen_deadline?: string | null;
  over_limit?: {
    enabled?: boolean;
    used_bytes?: number;
    limit_bytes?: number;
    addon_bytes?: number;
    max_bytes?: number;
  };
  billing_action_required?: boolean;
};

export function getClientBillingStatus(): BillingStatus | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("billing_status");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setClientBillingStatus(status: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("billing_status", JSON.stringify(status || {}));
  } catch {}
}

export function deriveBillingFlags(status: BillingStatus | null) {
  const accountState: AccountState = (status?.account_state ||
    "active") as AccountState;

  const overLimit = !!status?.over_limit?.enabled;

  const isGrace = accountState === "grace";
  const isFrozen = accountState === "frozen";

  // UX rules (match backend intent)
  const blockUploads = isGrace || isFrozen || overLimit;
  const blockCreateFolder = isGrace || isFrozen;
  const blockFriendActions = isFrozen;

  return {
    accountState,
    isGrace,
    isFrozen,
    overLimit,
    blockUploads,
    blockCreateFolder,
    blockFriendActions,
    graceDeadline: status?.grace_deadline || null,
    frozenDeadline: status?.frozen_deadline || null,
    billingActionRequired: !!status?.billing_action_required,
  };
}

export function formatCountdown(deadlineIso: string | null) {
  if (!deadlineIso) return null;

  const d = new Date(deadlineIso);
  if (isNaN(d.getTime())) return null;

  const diffMs = d.getTime() - Date.now();
  if (diffMs <= 0) return "0h";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remH = hours % 24;

  if (days > 0) return `${days}d ${remH}h`;
  return `${hours}h`;
}