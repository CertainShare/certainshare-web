"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import UploadFab from "../../components/UploadFab";

type MediaItem = {
  id: string;
  url: string;
};

export default function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [folderId, setFolderId] = useState<string | null>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // billing status (needed for delete confirmation message)
  const [isPaid, setIsPaid] = useState(false);

  async function loadBillingStatus() {
    try {
      const res = await apiFetch("/billing/status");
      setIsPaid(res?.plan !== "free");
    } catch {
      setIsPaid(false);
    }
  }

  async function loadAlbumMedia(folderId: string) {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(`/folders/${folderId}/media`);
      setItems(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load album");
    } finally {
      setLoading(false);
    }
  }

  // delete media inside album
  async function deleteMedia(mediaId: string) {
    const ok = confirm(
      isPaid
        ? "Delete media? This will move it to Trash."
        : "Delete media? This will permanently delete it."
    );

    if (!ok) return;

    try {
      await apiFetch(`/media/${mediaId}`, { method: "DELETE" });

      if (folderId) {
        await loadAlbumMedia(folderId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Step 1: Resolve params + check auth
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const resolvedParams = await params;
      setFolderId(resolvedParams.id);

      await loadBillingStatus();
    }

    init();
  }, [params]);

  // Step 2: Load album media once folderId is known
  useEffect(() => {
    if (!folderId) return;
    loadAlbumMedia(folderId);
  }, [folderId]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Album</h1>
            <div style={styles.subtitle}>Browse media inside this album.</div>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => window.history.back()}
              style={styles.headerButton}
            >
              ← Back
            </button>

            <Link href="/logout" style={styles.logoutButton}>
              Logout
            </Link>
          </div>
        </div>

        {/* LOADING */}
        {loading && <div style={styles.statusText}>Loading...</div>}

        {/* ERROR */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* EMPTY */}
        {!loading && !error && items.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No media in this album</div>
            <div style={styles.emptySub}>
              Upload photos or videos to start building this album.
            </div>
          </div>
        )}

        {/* GRID */}
        {!loading && !error && items.length > 0 && (
          <div style={styles.galleryCard}>
            <div style={styles.galleryHeader}>
              <div style={styles.galleryTitle}>Media</div>
              <div style={styles.galleryCount}>{items.length} items</div>
            </div>

            <div style={styles.grid}>
              {items.map((item) => (
                <div key={item.id} style={styles.tileWrap}>
                  <Link href={`/media/${item.id}`} style={styles.tile}>
                    <img src={item.url} alt="media" style={styles.tileImg} />
                  </Link>

                  <button
                    onClick={() => deleteMedia(item.id)}
                    style={styles.deleteOverlay}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING UPLOAD BUTTON */}
      {folderId && <UploadFab defaultFolderId={folderId} />}
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
    paddingTop: 6,
    paddingBottom: 18,
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

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  headerButton: {
    textDecoration: "none",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    color: "var(--text)",
    boxShadow: "var(--shadow-sm)",
  },

  logoutButton: {
    textDecoration: "none",
    background: "rgba(220,38,38,0.06)",
    border: "1px solid rgba(220,38,38,0.18)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    color: "#dc2626",
    boxShadow: "var(--shadow-sm)",
  },

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
    fontWeight: 650,
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 850,
  },

  emptyState: {
    marginTop: 26,
    padding: 26,
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "white",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "var(--text)",
  },

  emptySub: {
    marginTop: 10,
    fontSize: 14,
    color: "var(--muted)",
    maxWidth: 440,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.5,
  },

  galleryCard: {
    marginTop: 14,
    borderRadius: 22,
    background: "white",
    border: "1px solid var(--border)",
    padding: 16,
    boxShadow: "var(--shadow-md)",
  },

  galleryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
    flexWrap: "wrap",
  },

  galleryTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "var(--text)",
  },

  galleryCount: {
    fontSize: 12,
    fontWeight: 850,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
    color: "var(--text)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },

  tileWrap: {
    position: "relative",
  },

  tile: {
    display: "block",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.04)",
    boxShadow: "0px 10px 20px rgba(15,23,42,0.06)",
    textDecoration: "none",
  },

  tileImg: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    display: "block",
  },

  deleteOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid rgba(220,38,38,0.25)",
    background: "rgba(220,38,38,0.85)",
    color: "white",
    fontWeight: 900,
    fontSize: 13,
  },
};