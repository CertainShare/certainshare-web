"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

type TrashItem = {
  id: string;
  url: string;
  deleted_at: string;
};

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrash() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/media/trash");
      setItems(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trash");
    } finally {
      setLoading(false);
    }
  }

  async function restoreItem(mediaId: string) {
    try {
      await apiFetch(`/media/${mediaId}/restore`, { method: "POST" });
      await loadTrash();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deletePermanent(mediaId: string) {
    const ok = confirm("Permanently delete this media? This cannot be undone.");
    if (!ok) return;

    try {
      await apiFetch(`/media/${mediaId}/permanent`, { method: "DELETE" });
      await loadTrash();
    } catch (err: any) {
      alert(err.message);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadTrash();
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Trash</h1>
            <div style={styles.subtitle}>
              Items in Trash will stay here until permanently deleted.
            </div>
          </div>

          <div style={styles.headerActions}>
            <Link href="/mymedia" style={styles.backButton}>
              ← Back
            </Link>

            <Link href="/logout" style={styles.logoutButton}>
              Logout
            </Link>
          </div>
        </div>

        {loading && <div style={styles.centerText}>Loading...</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>Trash is empty</div>
            <div style={styles.emptySub}>
              Deleted photos and videos will show up here until removed forever.
            </div>

            <Link href="/mymedia" style={styles.primaryLink}>
              Back to My Media
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.imageBox}>
                  <img src={item.url} alt="trash" style={styles.image} />

                  <div style={styles.deletedBadge}>
                    Deleted{" "}
                    {item.deleted_at
                      ? new Date(item.deleted_at).toLocaleDateString()
                      : ""}
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => restoreItem(item.id)}
                    style={styles.restoreButton}
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => deletePermanent(item.id)}
                    style={styles.deleteButton}
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: 1100,
    margin: "0 auto",
    padding: 24,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "var(--muted)",
    fontWeight: 700,
    maxWidth: 650,
    lineHeight: "18px",
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  backButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  logoutButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "#dc2626",
    background: "white",
    border: "1px solid rgba(220,38,38,0.18)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  centerText: {
    marginTop: 30,
    textAlign: "center",
    fontWeight: 800,
    color: "var(--muted)",
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  emptyState: {
    marginTop: 30,
    padding: 24,
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 950,
    color: "var(--text)",
  },

  emptySub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  primaryLink: {
    display: "inline-block",
    marginTop: 16,
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "white",
    background: "var(--primary)",
    padding: "10px 14px",
    borderRadius: 14,
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: 16,
  },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },

  imageBox: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#f3f4f6",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  deletedBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.70)",
    color: "white",
    fontWeight: 900,
    fontSize: 11,
    backdropFilter: "blur(8px)",
  },

  cardActions: {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  restoreButton: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    cursor: "pointer",
    border: "1px solid rgba(37,99,235,0.25)",
    background: "rgba(37,99,235,0.08)",
    color: "#1d4ed8",
    fontWeight: 950,
    fontSize: 13,
  },

  deleteButton: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    cursor: "pointer",
    border: "1px solid rgba(220,38,38,0.25)",
    background: "rgba(220,38,38,0.08)",
    color: "#dc2626",
    fontWeight: 950,
    fontSize: 13,
  },
};