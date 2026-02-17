"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function DeleteAccountPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit =
    password.trim().length > 0 &&
    confirmText.trim().toUpperCase() === "DELETE" &&
    !loading;

  async function handleDelete() {
    setError("");
    setLoading(true);

    try {
      await apiFetch("/users/me/delete-account", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      setSuccess(true);

      // immediately log out user (token is now revoked anyway)
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() => router.back()}
          style={styles.backButton}
          disabled={loading}
        >
          ← Back
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Delete Account</h1>
          <div style={styles.subtitle}>
            Permanently delete your CertainShare account.
          </div>
        </div>

        <div style={styles.dangerCard}>
          <div style={styles.dangerTitle}>This action is permanent</div>

          <div style={styles.dangerText}>
            When you delete your account:
            <ul style={styles.list}>
              <li>Your account will be permanently disabled immediately.</li>
              <li>You will be logged out of all devices.</li>
              <li>Your media will be removed from your profile and feed.</li>
              <li>
                Your data may be retained for up to <b>30 days</b> for legal and
                compliance reasons, then permanently erased.
              </li>
            </ul>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.fieldLabel}>Password</div>
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            disabled={loading || success}
          />

          <div style={{ height: 14 }} />

          <div style={styles.fieldLabel}>
            Type <b>DELETE</b> to confirm
          </div>
          <input
            type="text"
            value={confirmText}
            placeholder="DELETE"
            onChange={(e) => setConfirmText(e.target.value)}
            style={styles.input}
            disabled={loading || success}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handleDelete}
            style={{
              ...styles.deleteButton,
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
            disabled={!canSubmit}
          >
            {loading ? "Deleting..." : "Delete My Account"}
          </button>

          <div style={styles.smallNote}>
            This cannot be undone. Your account cannot be recovered.
          </div>
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
    maxWidth: 760,
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
    cursor: "pointer",
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
  },

  dangerCard: {
    borderRadius: 18,
    background: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.25)",
    padding: 16,
    boxShadow: "var(--shadow-sm)",
    marginBottom: 16,
  },

  dangerTitle: {
    fontSize: 14,
    fontWeight: 950,
    color: "#b91c1c",
    marginBottom: 8,
  },

  dangerText: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(15,23,42,0.80)",
    lineHeight: "18px",
  },

  list: {
    marginTop: 10,
    marginBottom: 0,
    paddingLeft: 18,
  },

  card: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    padding: 16,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--muted2)",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    fontSize: 14,
    fontWeight: 800,
    outline: "none",
    background: "white",
    color: "var(--text)",
  },

  deleteButton: {
    width: "100%",
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "white",
    fontWeight: 950,
    fontSize: 14,
    boxShadow: "0px 18px 45px rgba(220,38,38,0.18)",
  },

  error: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: 900,
    color: "#b91c1c",
  },

  smallNote: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "16px",
    textAlign: "center",
  },
};