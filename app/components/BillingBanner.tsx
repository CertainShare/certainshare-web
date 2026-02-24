"use client";

import {
  deriveBillingFlags,
  formatCountdown,
  getClientBillingStatus,
} from "@/lib/billingGate";
import Link from "next/link";
import { useMemo } from "react";

export default function BillingBanner() {
  const status = useMemo(() => getClientBillingStatus(), []);
  const flags = deriveBillingFlags(status);

  const graceLeft = formatCountdown(flags.graceDeadline);
  const frozenLeft = formatCountdown(flags.frozenDeadline);

  if (!flags.isGrace && !flags.isFrozen && !flags.overLimit && !flags.billingActionRequired) {
    return null;
  }

  let title = "";
  let body = "";

  if (flags.billingActionRequired) {
    title = "Payment issue";
    body = "Update your payment method to avoid losing access.";
  } else if (flags.isFrozen) {
    title = "Account frozen";
    body = `Uploads and sharing are disabled. Access to shared content is restricted.${frozenLeft ? ` (${frozenLeft} left)` : ""}`;
  } else if (flags.isGrace) {
    title = "Grace period";
    body = `Uploads are disabled until billing is fixed.${graceLeft ? ` (${graceLeft} left)` : ""}`;
  } else if (flags.overLimit) {
    title = "Storage over limit";
    body = "Uploads are disabled until you free space or upgrade.";
  }

  return (
    <div
      style={{
        marginBottom: 14,
        borderRadius: 16,
        padding: 14,
        border: "1px solid rgba(245,158,11,0.25)",
        background: "rgba(245,158,11,0.08)",
        color: "#92400e",
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 950, marginBottom: 6 }}>{title}</div>
      <div style={{ fontWeight: 750, lineHeight: 1.45 }}>{body}</div>

      <div style={{ marginTop: 10 }}>
        <Link
          href="/settings/billing"
          style={{
            textDecoration: "none",
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(245,158,11,0.25)",
            background: "rgba(255,255,255,0.6)",
            color: "#92400e",
            fontWeight: 950,
          }}
        >
          Fix billing
        </Link>
      </div>
    </div>
  );
}