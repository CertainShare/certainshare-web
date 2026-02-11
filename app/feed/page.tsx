"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import Link from "next/link";
import UploadFab from "../components/UploadFab";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // track slideshow index per feed item
  const [slideIndexMap, setSlideIndexMap] = useState<Record<string, number>>(
    {}
  );

  async function loadFeed() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/feed");
      const loadedFeed = res.feed || [];
      setFeed(loadedFeed);

      // initialize slideshow indexes
      const newMap: Record<string, number> = {};
      loadedFeed.forEach((item: any) => {
        newMap[item.id] = 0;
      });
      setSlideIndexMap(newMap);
    } catch (err: any) {
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  function nextSlide(itemId: string, total: number) {
    setSlideIndexMap((prev) => {
      const current = prev[itemId] || 0;
      const next = current + 1 >= total ? 0 : current + 1;
      return { ...prev, [itemId]: next };
    });
  }

  function prevSlide(itemId: string, total: number) {
    setSlideIndexMap((prev) => {
      const current = prev[itemId] || 0;
      const next = current - 1 < 0 ? total - 1 : current - 1;
      return { ...prev, [itemId]: next };
    });
  }

  function goToSlide(itemId: string, index: number) {
    setSlideIndexMap((prev) => ({
      ...prev,
      [itemId]: index,
    }));
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
            {feed.map((item) => {
              const slideIndex = slideIndexMap[item.id] || 0;

              const isBatch =
                item.type === "batch" || item.type === "folder_batch";

              const items = isBatch ? item.items || [] : [];

              const activeItem = items.length > 0 ? items[slideIndex] : null;

              return (
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

                  {/* SINGLE */}
                  {item.type === "single" && (
                    <>
                      <div style={styles.imageWrap}>
                        <img
                          src={item.url}
                          alt="feed item"
                          style={styles.image}
                        />
                      </div>

                      {item.note && (
                        <div style={styles.caption}>
                      {item.note}
                        </div>
                      )}

                      <div style={styles.metaRow}>
                        <Link href={`/media/${item.id}`} style={styles.link}>
                          Open
                        </Link>
                      </div>
                    </>
                  )}

                  {/* FOLDER BATCH */}
                  {item.type === "folder_batch" && (
                    <>
                      <div style={styles.folderAction}>
                        <b>{item.owner?.display_name}</b> {item.action}
                      </div>

                      {activeItem && (
                        <div style={styles.carouselWrap}>
                          <img
                            src={activeItem.url}
                            alt="preview"
                            style={styles.carouselImage}
                          />

                          {items.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => prevSlide(item.id, items.length)}
                                style={styles.carouselArrowLeft}
                              >
                                ‹
                              </button>

                              <button
                                type="button"
                                onClick={() => nextSlide(item.id, items.length)}
                                style={styles.carouselArrowRight}
                              >
                                ›
                              </button>

                              <div style={styles.carouselDots}>
                                {items.map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => goToSlide(item.id, idx)}
                                    style={{
                                      ...styles.dot,
                                      ...(idx === slideIndex
                                        ? styles.dotActive
                                        : {}),
                                    }}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {activeItem?.note && (
                      <div style={styles.caption}>
                      {activeItem.note}
                      </div>
                      )}

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

                  {/* NORMAL BATCH (NON-FOLDER) */}
                  {item.type === "batch" && (
                    <>
                      <div style={styles.folderAction}>
                        <b>{item.owner?.display_name}</b> {item.action}
                      </div>

                      {activeItem && (
                        <div style={styles.carouselWrap}>
                          <img
                            src={activeItem.url}
                            alt="preview"
                            style={styles.carouselImage}
                          />

                          {items.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => prevSlide(item.id, items.length)}
                                style={styles.carouselArrowLeft}
                              >
                                ‹
                              </button>

                              <button
                                type="button"
                                onClick={() => nextSlide(item.id, items.length)}
                                style={styles.carouselArrowRight}
                              >
                                ›
                              </button>

                              <div style={styles.carouselDots}>
                                {items.map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => goToSlide(item.id, idx)}
                                    style={{
                                      ...styles.dot,
                                      ...(idx === slideIndex
                                        ? styles.dotActive
                                        : {}),
                                    }}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                          {activeItem?.note && (
                          <div style={styles.caption}>
                           {activeItem.note}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING UPLOAD BUTTON */}
      <UploadFab />
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

  // UPDATED: prevents huge tall images but still keeps clean instagram feel
  imageWrap: {
    width: "100%",
    maxHeight: 520,
    overflow: "hidden",
    background: "#000",
    borderTop: "1px solid rgba(15,23,42,0.06)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  image: {
    width: "100%",
    height: "100%",
    maxHeight: 520,
    objectFit: "contain",
    display: "block",
    background: "#000",
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

  // -------------------------
  // CAROUSEL STYLES (UPDATED)
  // -------------------------
  carouselWrap: {
    marginTop: 12,
    position: "relative",
    width: "100%",
    height: 520,
    overflow: "hidden",
    borderTop: "1px solid rgba(15,23,42,0.06)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    background: "#000",
  },

  carouselImage: {
    width: "100%",
    height: 520,
    objectFit: "contain",
    display: "block",
    background: "#000",
  },

  carouselArrowLeft: {
    position: "absolute",
    top: "50%",
    left: 10,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  carouselArrowRight: {
    position: "absolute",
    top: "50%",
    right: 10,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  carouselDots: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.35)",
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.45)",
    padding: 0,
  },

  dotActive: {
    background: "white",
  },

  floatingUpload: {
    position: "fixed",
    bottom: 26,
    right: 26,
    background: "#2563eb",
    color: "white",
    padding: "14px 18px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 14,
    textDecoration: "none",
    boxShadow: "0px 14px 32px rgba(37,99,235,0.35)",
    border: "1px solid rgba(37,99,235,0.40)",
    zIndex: 9999,
  },

  caption: {
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  borderBottom: "1px solid rgba(15,23,42,0.06)",
  background: "white",
  lineHeight: 1.5,
},
};