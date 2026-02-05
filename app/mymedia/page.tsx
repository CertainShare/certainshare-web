"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";

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

  const usagePercent = storage
    ? Math.min(storage.percent_full * 100, 100)
    : 0;

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
          {/* Banner */}
          <div style={styles.banner} />

          {/* Profile Row */}
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

                <div style={styles.profileBio}>
                  {me?.bio || "No bio yet."}
                </div>

                <div style={styles.planText}>
                  Plan: <b>{isPaid ? "Paid" : "Free"}</b>
                </div>
              </div>
            </div>

            <div style={styles.profileActions}>
              <Link href="/settings" style={styles.primaryButton}>
                Settings
              </Link>

              <Link href="/logout" style={styles.darkButton}>
                Logout
              </Link>
            </div>
          </div>

          {/* Storage */}
          {storage && (
            <div style={styles.storageBlock}>
              <div style={styles.storageHeader}>
                <span style={{ fontWeight: "bold" }}>Storage</span>
                <span>
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
            {view === "albums" && (
              <Link href="/new-album" style={styles.actionButton}>
                + New Album
              </Link>
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
          <div style={{ marginTop: 20 }}>
            {albums.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No albums yet</div>
                <div style={styles.emptySub}>
                  Create your first album to organize your memories.
                </div>
              </div>
            ) : (
              <div style={styles.gridAlbums}>
                {albums.map((album) => (
                  <div key={album.id} style={styles.albumCard}>
                    <Link href={`/album/${album.id}`} style={styles.albumLink}>
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

                    <div style={styles.albumFooter}>
                      <button
                        onClick={() => deleteAlbum(album.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UPLOADS VIEW */}
        {!loading && !error && view === "uploads" && (
          <div style={{ marginTop: 20 }}>
            {uploads.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle}>No uploads yet</div>
                <div style={styles.emptySub}>
                  Upload your first photo or video to start building your
                  library.
                </div>
              </div>
            ) : (
              <div style={styles.gridUploads}>
                {uploads.map((upload) => (
                  <div key={upload.id} style={styles.uploadCard}>
                    <Link href={`/media/${upload.id}`}>
                      <img
                        src={upload.url}
                        alt="upload"
                        style={styles.uploadImage}
                      />
                    </Link>

                    <div style={styles.visibilityBadge}>
                      {upload.visibility}
                    </div>

                    <button
                      onClick={() => deleteUpload(upload.id)}
                      style={styles.uploadDeleteButton}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING UPLOAD BUTTON */}
      <Link href="/upload" style={styles.floatingUpload}>
        + Upload
      </Link>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 0,
    background: "#f6f7fb",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 30,
  },

  profileCard: {
    borderRadius: 20,
    background: "white",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.06)",
  },

  banner: {
    height: 140,
    background:
      "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%)",
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
    width: 90,
    height: 90,
    borderRadius: 999,
    objectFit: "cover",
    border: "4px solid white",
    marginTop: -55,
    boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
    background: "#eee",
  },

  profileText: {
    marginTop: -10,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  profileBio: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
    maxWidth: 500,
    lineHeight: "18px",
  },

  planText: {
    marginTop: 10,
    fontSize: 13,
    color: "#777",
  },

  profileActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  primaryButton: {
    textDecoration: "none",
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 13,
    boxShadow: "0px 8px 20px rgba(37,99,235,0.25)",
  },

  darkButton: {
    textDecoration: "none",
    background: "#111827",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 13,
  },

  storageBlock: {
    padding: "0px 18px 18px 18px",
  },

  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },

  storageBarOuter: {
    height: 10,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },

  storageBarInner: {
    height: "100%",

    transition: "width 0.2s ease",
  },

  storagePercentText: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },

  tabRow: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  tabSwitcher: {
    display: "flex",
    gap: 10,
    padding: 6,
    borderRadius: 999,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.04)",
  },

  tabButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 13,
    background: "transparent",
    color: "#111827",
  },

  tabButtonActive: {
    background: "#2563eb",
    color: "white",
  },

  tabActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  actionButton: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #e5e7eb",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 13,
    color: "#111827",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.04)",
  },

  trashButton: {
    textDecoration: "none",
    background: "white",
    border: "1px solid #e5e7eb",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 13,
    color: "#dc2626",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.04)",
  },

  centerText: {
    marginTop: 30,
    textAlign: "center",
    color: "#555",
  },

  errorBox: {
    marginTop: 30,
    padding: 14,
    borderRadius: 14,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontWeight: "bold",
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

  gridAlbums: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },

  albumCard: {
    borderRadius: 18,
    overflow: "hidden",
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0px 12px 30px rgba(0,0,0,0.06)",
  },

  albumLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },

  albumImageBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#f3f4f6",
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
    color: "#bbb",
  },

  albumInfo: {
    padding: 14,
  },

  albumName: {
    fontWeight: "bold",
    fontSize: 15,
  },

  albumCount: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  albumFooter: {
    padding: 14,
    paddingTop: 0,
  },

  deleteButton: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid #eee",
    background: "#fafafa",
    fontWeight: "bold",
  },

  gridUploads: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 14,
  },

  uploadCard: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "white",
    boxShadow: "0px 12px 30px rgba(0,0,0,0.06)",
    position: "relative",
  },

  uploadImage: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    display: "block",
  },

  visibilityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(17,24,39,0.75)",
    color: "white",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },

  uploadDeleteButton: {
    width: "100%",
    padding: 10,
    cursor: "pointer",
    border: "none",
    background: "white",
    fontWeight: "bold",
  },

  floatingUpload: {
    position: "fixed",
    bottom: 30,
    right: 30,
    background: "#2563eb",
    color: "white",
    padding: "14px 18px",
    borderRadius: 999,
    fontWeight: "bold",
    textDecoration: "none",
    boxShadow: "0px 10px 25px rgba(37,99,235,0.35)",
  },
};