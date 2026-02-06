"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function SharingPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [defaultMedia, setDefaultMedia] = useState("private");
  const [defaultFolder, setDefaultFolder] = useState("private");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        const me = await apiFetch("/users/me");

        setDefaultMedia(me.default_media_visibility || "private");
        setDefaultFolder(me.default_folder_visibility || "private");
      } catch (err: any) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/users/me/sharing-defaults", {
        method: "PATCH",
        body: JSON.stringify({
          default_media_visibility: defaultMedia,
          default_folder_visibility: defaultFolder,
        }),
      });

      setSuccess("Saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings/privacy" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Sharing Preferences</h1>
          <div style={styles.subtitle}>
            Control the default privacy level for new uploads and albums.
          </div>
        </div>

        {loading && <div style={styles.statusText}>Loading...</div>}

        {error && <div style={styles.errorBox}>{error}</div>}

        {success && <div style={styles.successBox}>{success}</div>}

        {!loading && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Default upload visibility</div>

              <select
                value={defaultMedia}
                onChange={(e) => setDefaultMedia(e.target.value)}
                style={styles.select}
              >
                <option value="private">Private (only you)</option>
                <option value="shared">Shared (friends/shared users)</option>
                <option value="public">Public</option>
              </select>

              <div style={styles.helperText}>
                This will be the starting visibility for all new uploads.
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Default album visibility</div>

              <select
                value={defaultFolder}
                onChange={(e) => setDefaultFolder(e.target.value)}
                style={styles.select}
              >
                <option value="private">Private (only you)</option>
                <option value="shared">Shared (friends/shared users)</option>
                <option value="public">Public</option>
              </select>

              <div style={styles.helperText}>
                This will be the starting visibility for new albums.
              </div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              style={{
                ...styles.primaryButton,
                ...(saving ? styles.primaryButtonDisabled : {}),
              }}
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </>
        )}

        <div style={styles.footerNote}>
          CertainShare is private by default. These settings help you control
          what “default” means for your account.
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

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
    fontWeight: 650,
  },

  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },

  cardTitle: {
    fontWeight: 950,
    fontSize: 14,
    marginBottom: 10,
    color: "var(--text)",
  },

  select: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 800,
    fontSize: 14,
    outline: "none",
    cursor: "pointer",
  },

  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.5,
  },

  primaryButton: {
    marginTop: 16,
    width: "100%",
    background: "#2563eb",
    color: "white",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(37,99,235,0.40)",
    cursor: "pointer",
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

  footerNote: {
    marginTop: 16,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
  },
};