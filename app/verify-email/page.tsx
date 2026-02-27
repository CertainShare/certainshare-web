"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function VerifyEmailInfoPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // We will store this during signup/login
    const stored = localStorage.getItem("pending_verify_email");
    if (stored) setEmail(stored);
  }, []);

  async function handleResend() {
    setError("");
    setMessage("");
    setSending(true);

    try {
      if (!email) {
        throw new Error("Missing email. Please log in again.");
      }

      await apiFetch("/auth/verify-email/resend", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage("Verification email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
        Check your email
      </h1>

      <p style={{ marginTop: 12, color: "#444", lineHeight: 1.5 }}>
        We sent a verification link to{" "}
        <b>{email || "your email address"}</b>. Click it to activate your
        account.
      </p>

      <button
        onClick={handleResend}
        disabled={sending}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.12)",
          background: "#0f172a",
          color: "white",
          fontWeight: 900,
          cursor: sending ? "not-allowed" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? "Sending…" : "Resend verification email"}
      </button>

      {message && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.18)",
            color: "#166534",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.18)",
            color: "#991b1b",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Link
          href="/login"
          style={{ fontWeight: 900, textDecoration: "none", color: "#2563eb" }}
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}