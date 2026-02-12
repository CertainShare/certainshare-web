"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TwoFactorLoginPage() {
  const router = useRouter();

const [tempToken, setTempToken] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const token = sessionStorage.getItem("tempToken");

  if (!token) {
    router.push("/login");
    return;
  }

  setTempToken(token);
}, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!tempToken) {
  throw new Error("Missing 2FA session. Please log in again.");
}

    try {
      const res = await apiFetch("/2fa/verify-login", {
        method: "POST",
        body: JSON.stringify({
          tempToken,
          code,
        }),
      });

      const token = res.token;

      if (!token) {
        throw new Error("No token returned from server");
      }

      localStorage.setItem("token", token);
      sessionStorage.removeItem("tempToken");

      router.push("/feed");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>CS</div>
            <div>
              <div style={styles.brandName}>CertainShare</div>
              <div style={styles.brandTagline}>
                Private family memories, shared intentionally.
              </div>
            </div>
          </div>

          <h1 style={styles.title}>Two-Factor Authentication</h1>
          <div style={styles.subtitle}>
            Enter the 6-digit code from your authenticator app.
          </div>

          <form onSubmit={handleVerify} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>6-digit code</label>
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                style={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="123456"
              />
            </div>

            {error && <div style={styles.errorBox}>Error: {error}</div>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                ...styles.primaryButton,
                ...(loading || code.length !== 6
                  ? styles.primaryButtonDisabled
                  : {}),
              }}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div style={styles.footerRow}>
            <Link
            href="/login"
            style={styles.backLink}
            onClick={() => sessionStorage.removeItem("tempToken")}
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f6f7fb",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  container: {
    width: "100%",
    maxWidth: 440,
  },

  card: {
    background: "white",
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 22,
    boxShadow: "0px 18px 50px rgba(0,0,0,0.08)",
  },

  brandRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #4f46e5, #9333ea)",
    color: "white",
    fontWeight: 900,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.5px",
  },

  brandName: {
    fontWeight: 950,
    fontSize: 15,
    color: "#111827",
    letterSpacing: "-0.3px",
  },

  brandTagline: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: "16px",
  },

  title: {
    fontSize: 22,
    fontWeight: 950,
    margin: 0,
    marginTop: 6,
    color: "#111827",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: "18px",
  },

  form: {
    marginTop: 18,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 900,
    color: "#111827",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 18,
    letterSpacing: "4px",
    textAlign: "center",
    outline: "none",
  },

  errorBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 6,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(37,99,235,0.40)",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
    fontWeight: 950,
    fontSize: 14,
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  footerRow: {
    marginTop: 16,
    textAlign: "center",
  },

  backLink: {
    fontSize: 13,
    fontWeight: 900,
    textDecoration: "none",
    color: "#2563eb",
  },
};