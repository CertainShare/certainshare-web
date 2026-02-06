"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function LogoutAllDevicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogoutAll() {
    setLoading(true);
    setError("");

    try {
      await apiFetch("/users/me/logout-all", {
        method: "PATCH",
      });

      // Clear local token and redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Failed to log out all devices");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings/privacy" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Log out of all devices</h1>
          <div style={styles.subtitle}>
            Immediately sign out your account everywhere it’s currently logged
            in.
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.textBlock}>
            This will log you out on every phone, tablet, and computer currently
            signed into your account.
          </div>

          <div style={styles.textBlock}>
            If someone else has access to your account, this is the fastest way
            to kick them out.
          </div>

          <div style={styles.warningBox}>
            <div style={styles.warningTitle}>Important</div>
            <div style={styles.warningText}>
              You will need to log back in on all devices after this.
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            onClick={handleLogoutAll}
            disabled={loading}
            style={{
              ...styles.dangerButton,
              ...(loading ? styles.dangerButtonDisabled : {}),
            }}
          >
            {loading ? "Logging out..." : "Log out of all devices"}
          </button>
        </div>

        <div style={styles.footerNote}>
          If you suspect account compromise, change your password next.
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: 24,
  },

  backButton: {
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 850,
    fontSize: 13,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  header: {
    marginTop: 16,
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.5,
    maxWidth: 640,
  },

  card: {
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    padding: 18,
    boxShadow: "var(--shadow-md)",
  },

  textBlock: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--text)",
    fontWeight: 650,
    marginBottom: 10,
  },

  warningBox: {
    marginTop: 14,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.20)",
  },

  warningTitle: {
    fontWeight: 950,
    fontSize: 13,
    color: "#92400e",
    marginBottom: 6,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "#92400e",
    fontWeight: 700,
  },

  errorBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  dangerButton: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(220,38,38,0.35)",
    background: "#dc2626",
    color: "white",
    fontWeight: 950,
    cursor: "pointer",
    fontSize: 14,
    boxShadow: "0px 14px 30px rgba(220,38,38,0.22)",
    marginTop: 6,
  },

  dangerButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  footerNote: {
    marginTop: 16,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
  },
};