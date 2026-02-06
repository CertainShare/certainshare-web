"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import Link from "next/link";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFeed() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/feed");
      setFeed(res.feed || []);
    } catch (err: any) {
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadFeed();
  }, []);

  return (
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Feed</h1>
            <div style={styles.subtitle}>
              Recent activity from your friends and shared albums.
            </div>
          </div>

          <button onClick={loadFeed} style={styles.refreshButton}>
            Refresh
          </button>
        </div>

        {loading && <p style={styles.statusText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && feed.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No feed activity yet</div>
            <div style={styles.emptySub}>
              Add friends or share content to start seeing posts here.
            </div>
          </div>
        )}

        {!loading && !error && feed.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {feed.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.userRow}>
                    <div style={styles.avatarCircle}>
                      {(item.owner?.display_name || "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div style={styles.username}>
                        {item.owner?.display_name || "Unknown"}
                      </div>
                      <div style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <span style={styles.badge}>{item.visibility}</span>
                </div>

                {item.type === "single" && (
                  <>
                    <img src={item.url} alt="feed item" style={styles.image} />

                    <div style={styles.metaRow}>
                      <Link href={`/media/${item.id}`} style={styles.link}>
                        Open
                      </Link>
                    </div>
                  </>
                )}

                {item.type === "folder_batch" && (
                  <>
                    <div style={styles.folderAction}>
                      <b>{item.owner?.display_name}</b> {item.action}
                    </div>

                    <div style={styles.previewGrid}>
                      {(item.items || []).slice(0, 6).map((p: any) => (
                        <img
                          key={p.id}
                          src={p.url}
                          alt="preview"
                          style={styles.previewImg}
                        />
                      ))}
                    </div>

                    <div style={styles.metaRow}>
                      {item.folder_id && (
                        <Link
                          href={`/album/${item.folder_id}`}
                          style={styles.link}
                        >
                          View Album
                        </Link>
                      )}
                    </div>
                  </>
                )}
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
    maxWidth: 900,
    margin: "0 auto",
    padding: 24,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 6,
    paddingBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 750,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--muted)",
  },

  refreshButton: {
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "white",
    fontWeight: 700,
    fontSize: 13,
    color: "#0f172a",
    boxShadow: "var(--shadow-sm)",
  },

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
  },

  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontWeight: 600,
  },

  card: {
    borderRadius: 18,
    background: "var(--card)",
    border: "1px solid var(--border)",
    padding: 14,
    marginBottom: 14,
    boxShadow: "var(--shadow-md)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "rgba(37,99,235,0.12)",
    border: "1px solid rgba(37,99,235,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#2563eb",
    fontSize: 14,
  },

  username: {
    fontWeight: 750,
    fontSize: 14,
    color: "var(--text)",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 12,
    color: "var(--muted2)",
  },

  badge: {
    background: "rgba(15,23,42,0.06)",
    color: "#0f172a",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid rgba(15,23,42,0.08)",
    whiteSpace: "nowrap",
  },

  image: {
    width: "100%",
    borderRadius: 16,
    objectFit: "cover",
    maxHeight: 460,
    border: "1px solid rgba(15,23,42,0.06)",
  },

  metaRow: {
    marginTop: 12,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  link: {
    textDecoration: "none",
    fontWeight: 750,
    fontSize: 13,
    color: "var(--primary)",
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(37,99,235,0.18)",
    background: "rgba(37,99,235,0.06)",
  },

  previewGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },

  previewImg: {
    width: "100%",
    height: 110,
    borderRadius: 14,
    objectFit: "cover",
    border: "1px solid rgba(15,23,42,0.06)",
  },

  folderAction: {
    marginTop: 4,
    fontSize: 14,
    color: "var(--text)",
  },

  emptyState: {
    marginTop: 30,
    padding: 26,
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "white",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "var(--text)",
  },

  emptySub: {
    marginTop: 10,
    fontSize: 14,
    color: "var(--muted)",
    maxWidth: 420,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.5,
  },
};