"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function NewAlbumPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/folders", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      router.push("/mymedia");
    } catch (err: any) {
      setError(err.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/mymedia" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>New Album</h1>
          <div style={styles.subtitle}>
            Create a private album to organize your media.
          </div>
        </div>

        <form onSubmit={createAlbum} style={styles.card}>
          <div style={styles.field}>
            <label style={styles.label}>Album Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Example: Vacation 2026"
            />

            <div style={styles.helperText}>
              Choose a name that you’ll recognize later.
            </div>
          </div>

          {error && <div style={styles.errorBox}>Error: {error}</div>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              ...styles.primaryButton,
              ...(loading || !name.trim() ? styles.primaryButtonDisabled : {}),
            }}
          >
            {loading ? "Creating..." : "Create Album"}
          </button>
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
    maxWidth: 520,
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
  },

  card: {
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    padding: 18,
    boxShadow: "var(--shadow-md)",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: 900,
    color: "var(--text)",
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  helperText: {
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.5,
  },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 850,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    border: "1px solid rgba(37,99,235,0.40)",
    background: "#2563eb",
    color: "white",
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  primaryButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.6,
    boxShadow: "none",
  },
};