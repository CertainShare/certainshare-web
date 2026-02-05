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
          <h1 style={styles.title}>Feed</h1>

          <button onClick={loadFeed} style={styles.refreshButton}>
            Refresh
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && feed.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No feed activity yet</div>
            <div style={styles.emptySub}>
              Add friends or share content to start seeing posts here.
            </div>
          </div>
        )}

        {!loading && !error && feed.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {feed.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ fontWeight: "bold" }}>
                    {item.owner?.display_name || "Unknown"}
                  </div>

                  <div style={styles.timestamp}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>

                {item.type === "single" && (
                  <>
                    <img
                      src={item.url}
                      alt="feed item"
                      style={styles.image}
                    />

                    <div style={styles.metaRow}>
                      <span style={styles.badge}>{item.visibility}</span>

                      <Link href={`/media/${item.id}`} style={styles.link}>
                        Open
                      </Link>
                    </div>
                  </>
                )}

                {item.type === "folder_batch" && (
                  <>
                    <div style={{ marginTop: 10, fontSize: 14 }}>
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
                      <span style={styles.badge}>{item.visibility}</span>

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
    background: "#f6f7fb",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 30,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  refreshButton: {
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "white",
    fontWeight: "bold",
  },

  card: {
    borderRadius: 16,
    background: "white",
    border: "1px solid #e5e7eb",
    padding: 14,
    marginBottom: 14,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  timestamp: {
    fontSize: 12,
    color: "#666",
  },

  image: {
    width: "100%",
    borderRadius: 14,
    objectFit: "cover",
    maxHeight: 420,
  },

  metaRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    background: "#111827",
    color: "white",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },

  link: {
    textDecoration: "none",
    fontWeight: "bold",
    color: "#2563eb",
  },

  previewGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },

  previewImg: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #eee",
  },

  emptyState: {
    marginTop: 30,
    padding: 24,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    background: "white",
    textAlign: "center",
    color: "#666",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  emptySub: {
    marginTop: 8,
  },
};