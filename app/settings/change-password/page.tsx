"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  async function handleChangePassword(e: any) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
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
          <h1 style={styles.title}>Change Password</h1>
          <div style={styles.subtitle}>
            Choose a strong password to keep your account secure.
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={styles.card}>
          <div style={styles.field}>
            <label style={styles.label}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter current password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter new password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm new password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={styles.input}
              placeholder="Confirm new password"
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {message && <div style={styles.successBox}>{message}</div>}

          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              ...(loading ? styles.primaryButtonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <div style={styles.note}>
            Tip: use at least 12 characters with a mix of letters, numbers, and
            symbols.
          </div>
        </form>
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
    maxWidth: 620,
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
    maxWidth: 520,
  },

  card: {
    background: "white",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: 18,
    boxShadow: "var(--shadow-md)",
  },

  field: {
    marginTop: 14,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 950,
    color: "var(--text)",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  primaryButton: {
    marginTop: 18,
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

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  successBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#166534",
    fontWeight: 900,
    fontSize: 13,
  },

  note: {
    marginTop: 14,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
    textAlign: "center",
  },
};