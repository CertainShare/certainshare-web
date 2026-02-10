"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import UploadFab from "../components/UploadFab";

type Album = {
  id: string;
  name: string;
  hero_uri: string | null;
  media: any[];
};

type Upload = {
  id: string;
  url: string;
  visibility: "private" | "shared" | "public" | "custom";
};

export default function MyMediaPage() {
  const [view, setView] = useState<"albums" | "uploads">("albums");
  const [me, setMe] = useState<any>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPaid, setIsPaid] = useState(false);
  const [storage, setStorage] = useState<any>(null);

  // NEW: multi-select delete mode (uploads)
  const [selectMode, setSelectMode] = useState(false);
  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>([]);
  const selectedCount = selectedUploadIds.length;

  // NEW: multi-select delete mode (albums)
  const [selectModeAlbums, setSelectModeAlbums] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const selectedAlbumCount = selectedAlbumIds.length;

  async function loadMe() {
    const res = await apiFetch("/users/me");
    setMe(res);
  }

  async function loadBillingStatus() {
    try {
      const res = await apiFetch("/billing/status");
      setIsPaid(res?.plan !== "free");
    } catch {
      setIsPaid(false);
    }
  }

  async function loadStorageFullness() {
    const res = await apiFetch("/storage/fullness");
    setStorage(res);
  }

  async function loadAlbums() {
    const res = await apiFetch("/folders");
    setAlbums(res || []);
  }

  async function loadUploads() {
    const res = await apiFetch("/media/my");
    setUploads(res || []);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");

    try {
      await loadMe();
      await loadBillingStatus();
      await loadStorageFullness();
      await loadAlbums();
      await loadUploads();
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAlbum(folderId: string) {
    const ok = confirm(
      isPaid
        ? "Delete folder? This will move media into Trash."
        : "Delete folder? This will permanently delete all media inside it."
    );

    if (!ok) return;

    try {
      await apiFetch(`/folders/${folderId}`, { method: "DELETE" });
      await refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteUpload(mediaId: string) {
    const ok = confirm(
      isPaid
        ? "Delete media? This will move it to Trash."
        : "Delete media? This will permanently delete it."
    );

    if (!ok) return;

    try {
      await apiFetch(`/media/${mediaId}`, { method: "DELETE" });
      await refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // NEW: bulk delete uploads
  async function deleteSelectedUploads() {
    if (selectedUploadIds.length === 0) return;

    const ok = confirm(
      isPaid
        ? `Delete ${selectedUploadIds.length} item(s)? This will move them to Trash.`
        : `Delete ${selectedUploadIds.length} item(s)? This will permanently delete them.`
    );

    if (!ok) return;

    try {
      for (const id of selectedUploadIds) {
        await apiFetch(`/media/${id}`, { method: "DELETE" });
      }

      setSelectedUploadIds([]);
      setSelectMode(false);

      await refreshAll();
    } catch (err: any) {
      alert(err.message || "Failed to delete selected uploads.");
    }
  }

  // NEW: bulk delete albums
  async function deleteSelectedAlbums() {
    if (selectedAlbumIds.length === 0) return;

    const ok = confirm(
      isPaid
        ? `Delete ${selectedAlbumIds.length} album(s)? This will move media into Trash.`
        : `Delete ${selectedAlbumIds.length} album(s)? This will permanently delete all media inside them.`
    );

    if (!ok) return;

    try {
      for (const id of selectedAlbumIds) {
        await apiFetch(`/folders/${id}`, { method: "DELETE" });
      }

      setSelectedAlbumIds([]);
      setSelectModeAlbums(false);

      await refreshAll();
    } catch (err: any) {
      alert(err.message || "Failed to delete selected albums.");
    }
  }

  function toggleSelected(id: string) {
    setSelectedUploadIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectedAlbum(id: string) {
    setSelectedAlbumIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedUploadIds([]);
  }

  function exitSelectModeAlbums() {
    setSelectModeAlbums(false);
    setSelectedAlbumIds([]);
  }

  // remember which tab user was on
  useEffect(() => {
    const saved = localStorage.getItem("mymedia_view");
    if (saved === "albums" || saved === "uploads") {
      setView(saved);
    }
  }, []);

  // auth guard + initial load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    refreshAll();
  }, []);

  // NEW: if user switches tabs, exit select mode
  useEffect(() => {
    exitSelectMode();
    exitSelectModeAlbums();
  }, [view]);

  const usagePercent = storage ? Math.min(storage.percent_full * 100, 100) : 0;

  const usedGB = storage ? storage.used_bytes / 1024 / 1024 / 1024 : 0;
  const totalGB = storage ? storage.max_bytes / 1024 / 1024 / 1024 : 1;

  const barColor =
    usagePercent >= 90 ? "#dc2626" : usagePercent >= 70 ? "#f97316" : "#2563eb";

  return (
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        {/* PROFILE HEADER */}
        <div style={styles.profileCard}>
          <div style={styles.banner} />

          <div style={styles.profileRow}>
            <div style={styles.profileLeft}>
              <img
                src={
                  me?.profile_photo_url ||
                  "https://www.gravatar.com/avatar/?d=mp&s=200"
                }
                alt="Profile"
                style={styles.profileImage}
              />

              <div style={styles.profileText}>
                <div style={styles.profileName}>
                  {me?.display_name || "Your Profile"}
                </div>

                <div style={styles.profileBio}>{me?.bio || "No bio yet."}</div>

                <div style={styles.planText}>
                  Plan: <b>{isPaid ? "Paid" : "Free"}</b>
                </div>
              </div>
            </div>

            <div style={styles.profileActions}>
              <Link href="/settings" style={styles.secondaryButton}>
                Settings
              </Link>

              <Link href="/logout" style={styles.darkButton}>
                Logout
              </Link>
            </div>
          </div>

          {/* STORAGE */}
          {storage && (
            <div style={styles.storageBlock}>
              <div style={styles.storageHeader}>
                <span style={styles.storageLabel}>Storage</span>
                <span style={styles.storageNumbers}>
                  {usedGB.toFixed(2)} GB / {totalGB.toFixed(2)} GB
                </span>
              </div>

              <div style={styles.storageBarOuter}>
                <div
                  style={{
                    ...styles.storageBarInner,
                    width: `${usagePercent}%`,
                    background: barColor,
                  }}
                />
              </div>

              <div style={styles.storagePercentText}>
                {Math.round(storage.percent_full * 100)}% used
              </div>
            </div>
          )}
        </div>

        {/* TAB + ACTIONS */}
        <div style={styles.tabRow}>
          <div style={styles.tabSwitcher}>
            <button
              onClick={() => {
                setView("albums");
                localStorage.setItem("mymedia_view", "albums");
              }}
              style={{
                ...styles.tabButton,
                ...(view === "albums" ? styles.tabButtonActive : {}),
              }}
            >
              Albums
            </button>

            <button
              onClick={() => {
                setView("uploads");
                localStorage.setItem("mymedia_view", "uploads");
              }}
              style={{
                ...styles.tabButton,
                ...(view === "uploads" ? styles.tabButtonActive : {}),
              }}
            >
              Uploads
            </button>
          </div>

          <div style={styles.tabActions}>
            {view === "albums" && !selectModeAlbums && albums.length > 0 && (
              <button
                onClick={() => setSelectModeAlbums(true)}
                style={styles.actionButton}
              >
                Select
              </button>
            )}

            {view === "albums" && selectModeAlbums && (
              <button
                onClick={exitSelectModeAlbums}
                style={styles.actionButton}
              >
                Cancel
              </button>
            )}

            {view === "uploads" && !selectMode && uploads.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                style={styles.actionButton}
              >
                Select
              </button>
            )}

            {view === "uploads" && selectMode && (
              <button onClick={exitSelectMode} style={styles.actionButton}>
                Cancel
              </button>
            )}

            {isPaid && (
              <Link href="/trash" style={styles.trashButton}>
                Trash
              </Link>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loading && <div style={styles.centerText}>Loading...</div>}

        {/* ERROR */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* ALBUMS VIEW */}
        {!loading && !error && view === "albums" && (
          <div style={{ marginTop: 18 }}>
            {albums.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No albums yet</div>
                <div style={styles.emptySub}>
                  Create your first album to organize your memories.
                </div>
              </div>
            ) : (
              <>
                <div style={styles.gridAlbums}>
                  {albums.map((album) => {
                    const selected = selectedAlbumIds.includes(album.id);

                    return (
                      <div
                        key={album.id}
                        style={{
                          ...styles.albumCard,
                          ...(selected ? styles.albumCardSelected : {}),
                        }}
                        onClick={() => {
                          if (selectModeAlbums) {
                            toggleSelectedAlbum(album.id);
                          }
                        }}
                      >
                        <Link
                          href={`/album/${album.id}`}
                          style={styles.albumLink}
                          onClick={(e) => {
                            if (selectModeAlbums) e.preventDefault();
                          }}
                        >
                          <div style={styles.albumImageBox}>
                            {album.hero_uri ? (
                              <img
                                src={album.hero_uri}
                                alt={album.name}
                                style={styles.albumImage}
                              />
                            ) : (
                              <div style={styles.albumPlaceholder}>📁</div>
                            )}
                          </div>

                          <div style={styles.albumInfo}>
                            <div style={styles.albumName}>{album.name}</div>
                            <div style={styles.albumCount}>
                              {album.media?.length || 0} items
                            </div>
                          </div>
                        </Link>

                        {/* Selection check */}
                        {selectModeAlbums && (
                          <div style={styles.checkCircle}>
                            {selected ? "✓" : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bulk delete bar */}
                {selectModeAlbums && (
                  <div style={styles.bulkBar}>
                    <button
                      onClick={deleteSelectedAlbums}
                      disabled={selectedAlbumCount === 0}
                      style={{
                        ...styles.bulkDeleteButton,
                        ...(selectedAlbumCount === 0
                          ? styles.bulkDeleteDisabled
                          : {}),
                      }}
                    >
                      Delete
                    </button>

                    <div style={styles.bulkText}>
                      {selectedAlbumCount} selected
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* UPLOADS VIEW */}
        {!loading && !error && view === "uploads" && (
          <div style={{ marginTop: 18 }}>
            {uploads.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No uploads yet</div>
                <div style={styles.emptySub}>
                  Upload your first photo or video to start building your
                  library.
                </div>
              </div>
            ) : (
              <>
                <div style={styles.gridUploads}>
                  {uploads.map((upload) => {
                    const selected = selectedUploadIds.includes(upload.id);

                    return (
                      <div
                        key={upload.id}
                        style={{
                          ...styles.uploadCard,
                          ...(selected ? styles.uploadCardSelected : {}),
                        }}
                        onClick={() => {
                          if (selectMode) {
                            toggleSelected(upload.id);
                          }
                        }}
                      >
                        <Link
                          href={`/media/${upload.id}`}
                          onClick={(e) => {
                            if (selectMode) e.preventDefault();
                          }}
                        >
                          <img
                            src={upload.url}
                            alt="upload"
                            style={styles.uploadImage}
                          />
                        </Link>

                        {/* Selection check */}
                        {selectMode && (
                          <div style={styles.checkCircle}>
                            {selected ? "✓" : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bulk delete bar */}
                {selectMode && (
                  <div style={styles.bulkBar}>
                    <button
                      onClick={deleteSelectedUploads}
                      disabled={selectedCount === 0}
                      style={{
                        ...styles.bulkDeleteButton,
                        ...(selectedCount === 0
                          ? styles.bulkDeleteDisabled
                          : {}),
                      }}
                    >
                      Delete
                    </button>

                    <div style={styles.bulkText}>{selectedCount} selected</div>
                  </div>
                )}
              </>
            )}
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
    padding: 0,
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 24,
    paddingBottom: 90,
  },

  profileCard: {
    borderRadius: 22,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },

  banner: {
    height: 140,
    background:
      "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(147,51,234,1) 100%)",
  },

  profileRow: {
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },

  profileLeft: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 999,
    objectFit: "cover",
    border: "4px solid white",
    marginTop: -55,
    boxShadow: "0px 10px 24px rgba(15,23,42,0.22)",
    background: "#eee",
  },

  profileText: {
    marginTop: -10,
  },

  profileName: {
    fontSize: 22,
    fontWeight: 850,
    letterSpacing: "-0.4px",
    color: "var(--text)",
  },

  profileBio: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--muted)",
    maxWidth: 520,
    lineHeight: 1.5,
  },

  planText: {
    marginTop: 10,
    fontSize: 13,
    color: "var(--muted2)",
  },

  profileActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  secondaryButton: {
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

  darkButton: {
    textDecoration: "none",
    background: "#0f172a",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    border: "1px solid rgba(15,23,42,0.20)",
  },

  storageBlock: {
    padding: "0px 18px 18px 18px",
  },

  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },

  storageLabel: {
    fontWeight: 850,
    color: "var(--text)",
  },

  storageNumbers: {
    color: "var(--muted)",
    fontWeight: 650,
  },

  storageBarOuter: {
    height: 10,
    borderRadius: 999,
    background: "rgba(15,23,42,0.08)",
    overflow: "hidden",
  },

  storageBarInner: {
    height: "100%",
    transition: "width 0.2s ease",
  },

  storagePercentText: {
    marginTop: 8,
    fontSize: 12,
    color: "var(--muted2)",
  },

  tabRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  tabSwitcher: {
    display: "flex",
    gap: 8,
    padding: 6,
    borderRadius: 999,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },

  tabButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 850,
    fontSize: 13,
    background: "transparent",
    color: "#475569",
  },

  tabButtonActive: {
    background: "rgba(37,99,235,0.12)",
    color: "#2563eb",
  },

  tabActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  actionButton: {
    textDecoration: "none",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    color: "var(--text)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
  },

  trashButton: {
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

  centerText: {
    marginTop: 30,
    textAlign: "center",
    color: "var(--muted)",
    fontWeight: 650,
  },

  errorBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 800,
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
    fontWeight: 850,
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

  gridAlbums: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },

  albumCard: {
    borderRadius: 18,
    overflow: "hidden",
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    transition: "transform 0.15s ease",
    position: "relative",
    cursor: "pointer",
  },

  albumCardSelected: {
    outline: "3px solid rgba(37,99,235,0.65)",
    outlineOffset: 0,
  },

  albumLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },

  albumImageBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "rgba(15,23,42,0.04)",
  },

  albumImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  albumPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    color: "#94a3b8",
  },

  albumInfo: {
    padding: 14,
  },

  albumName: {
    fontWeight: 850,
    fontSize: 15,
    color: "var(--text)",
  },

  albumCount: {
    fontSize: 13,
    color: "var(--muted)",
    marginTop: 4,
  },

  gridUploads: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 14,
  },

  uploadCard: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid var(--border)",
    background: "white",
    boxShadow: "var(--shadow-md)",
    position: "relative",
    cursor: "pointer",
  },

  uploadCardSelected: {
    outline: "3px solid rgba(37,99,235,0.65)",
    outlineOffset: 0,
  },

  uploadImage: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    display: "block",
  },

  checkCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 999,
    background: "rgba(15,23,42,0.75)",
    color: "white",
    fontWeight: 950,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255,255,255,0.65)",
  },

  bulkBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    background: "white",
    borderTop: "1px solid rgba(15,23,42,0.10)",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 14,
    zIndex: 9999,
    boxShadow: "0px -10px 30px rgba(0,0,0,0.10)",
  },

  bulkText: {
    fontWeight: 900,
    color: "var(--text)",
    fontSize: 14,
  },

  bulkDeleteButton: {
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid rgba(220,38,38,0.25)",
    background: "rgba(220,38,38,0.10)",
    color: "#dc2626",
    fontWeight: 950,
    fontSize: 13,
  },

  bulkDeleteDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};