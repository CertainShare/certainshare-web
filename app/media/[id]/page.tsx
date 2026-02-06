"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

type UploadItem = {
  id: string;
  url: string;
  visibility: string;
};

export default function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [mediaId, setMediaId] = useState<string | null>(null);

  const [item, setItem] = useState<UploadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMediaFromList(mediaId: string) {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/media/my");

      const found = (res || []).find((x: any) => x.id === mediaId);

      if (!found) {
        throw new Error("Media not found");
      }

      setItem(found);
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const resolvedParams = await params;
      setMediaId(resolvedParams.id);
    }

    init();
  }, [params]);

  useEffect(() => {
    if (!mediaId) return;
    loadMediaFromList(mediaId);
  }, [mediaId]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Media Viewer</h1>
            <div style={styles.subtitle}>
              Private, secure storage — only shared intentionally.
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

        {/* LOADING */}
        {loading && <div style={styles.statusText}>Loading...</div>}

        {/* ERROR */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* MEDIA VIEW */}
        {!loading && !error && item && (
          <div style={styles.viewerCard}>
            {/* MEDIA */}
            <div style={styles.viewerTop}>
              <div style={styles.imageStage}>
                <img src={item.url} alt="media" style={styles.image} />
              </div>
            </div>

            {/* DETAILS */}
            <div style={styles.viewerBottom}>
              <div style={styles.detailsRow}>
                <div style={styles.detailsLeft}>
                  <div style={styles.detailLabel}>Visibility</div>
                  <div style={styles.detailValue}>
                    <span style={styles.visibilityBadge}>{item.visibility}</span>
                  </div>
                </div>

                <div style={styles.detailsRight}>
                  <div style={styles.detailLabel}>Status</div>
                  <div style={styles.detailValue}>
                    <span style={styles.statusBadge}>Stored securely</span>
                  </div>
                </div>
              </div>

              <div style={styles.noteBox}>
                This file is stored inside your CertainShare library. You can
                change visibility from the upload settings later.
              </div>
            </div>
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
    maxWidth: 980,
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
    fontWeight: 950,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: 1.5,
    maxWidth: 640,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  backButton: {
    textDecoration: "none",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 950,
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
    fontWeight: 950,
    fontSize: 13,
    color: "#dc2626",
    boxShadow: "var(--shadow-sm)",
  },

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
    fontWeight: 850,
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 950,
    fontSize: 13,
  },

  viewerCard: {
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid var(--border)",
    background: "white",
    boxShadow: "var(--shadow-md)",
  },

  viewerTop: {
    background: "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02))",
    padding: 14,
  },

  imageStage: {
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(15,23,42,0.08)",
    border: "1px solid rgba(15,23,42,0.10)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    maxHeight: 680,
    objectFit: "contain",
    display: "block",
    background: "rgba(15,23,42,0.92)",
  },

  viewerBottom: {
    padding: 18,
  },

  detailsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },

  detailsLeft: {
    flex: 1,
    minWidth: 200,
  },

  detailsRight: {
    flex: 1,
    minWidth: 200,
    textAlign: "right",
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: 950,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  detailValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 950,
    color: "var(--text)",
  },

  visibilityBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 950,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
    color: "var(--text)",
  },

  statusBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 950,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.18)",
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
  },

  noteBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(37,99,235,0.14)",
    background: "rgba(37,99,235,0.06)",
    fontSize: 13,
    fontWeight: 750,
    color: "var(--text)",
    lineHeight: "18px",
  },
};