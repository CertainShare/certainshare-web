"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [folderName, setFolderName] = useState<string>("Album");
  const [folderOwnerId, setFolderOwnerId] = useState<string | null>(null);
  const [sharedUserIds, setSharedUserIds] = useState<string[]>([]);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Select mode
const [selectMode, setSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<string[]>([]);

// Delete modal
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

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

  async function loadFolderMeta(folderId: string) {
  try {
    const res = await apiFetch(`/folders/${folderId}/meta`);
    setFolderName(res?.name || "Album");
    setFolderOwnerId(res?.owner_id || null);
    setSharedUserIds(res?.shared_user_ids || []);
  } catch {
    setFolderName("Album");
    setFolderOwnerId(null);
    setSharedUserIds([]);
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

      // ✅ onboarding/profile gate
      const me = await apiFetch("/users/me", { gateOnboarding: true });
      if (!me) return;

      const resolvedParams = await params;
      setFolderId(resolvedParams.id);
      await loadFolderMeta(resolvedParams.id);

      await loadBillingStatus();
    }

    init();
  }, [params]);

  // Step 2: Load album media once folderId is known
  useEffect(() => {
    if (!folderId) return;
    loadAlbumMedia(folderId);
  }, [folderId]);

  useEffect(() => {
  setSelectMode(false);
  setSelectedIds([]);
}, [folderId]);

  function toggleSelected(id: string) {
  setSelectedIds((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
}

async function handleConfirmDelete() {
  if (deleteTargetIds.length === 0) return;

  try {
    await Promise.all(
      deleteTargetIds.map((id) =>
        apiFetch(`/media/${id}`, { method: "DELETE" })
      )
    );

    setShowDeleteModal(false);
    setDeleteTargetIds([]);
    setSelectedIds([]);
    setSelectMode(false);

    if (folderId) {
      await loadAlbumMedia(folderId);
    }
  } catch (err: any) {
    alert(err.message || "Delete failed.");
  }
}

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.headerWrap}>
          <div style={styles.headerLeft}>
            <button
              onClick={() => window.history.back()}
              style={styles.backButton}
            >
              ←
            </button>
          </div>

          <div style={styles.headerCenter}>
            <div style={styles.albumTitle}>{folderName}</div>

            {sharedUserIds.length > 0 && (
              <div style={styles.albumShared}>
                Shared with {sharedUserIds.length}{" "}
                {sharedUserIds.length === 1 ? "person" : "people"}
              </div>
            )}
          </div>

          <div style={styles.headerRight}>
            {!selectMode && items.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                style={styles.selectButton}
              >
                Select
              </button>
            )}

            {selectMode && (
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedIds([]);
                }}
                style={styles.selectButton}
              >
                Cancel
              </button>
            )}
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
          <div style={styles.grid}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.tileWrap,
                  ...(selectedIds.includes(item.id)
                    ? styles.tileSelected
                    : {}),
                }}
                onClick={() => {
                  if (selectMode) toggleSelected(item.id);
                }}
              >
                <Link
                  href={`/media/${item.id}?album=${folderId}`}
                  style={styles.tile}
                  onClick={(e) => {
                    if (selectMode) e.preventDefault();
                  }}
                >
                  <img src={item.url} alt="media" style={styles.tileImg} />
                </Link>

                {selectMode && (
                  <div style={styles.checkCircle}>
                    {selectedIds.includes(item.id) ? "✓" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {selectMode && (
        <div style={styles.bulkBar}>
          <button
            disabled={selectedIds.length === 0}
            style={{
              ...styles.bulkDeleteButton,
              ...(selectedIds.length === 0
                ? styles.bulkDeleteDisabled
                : {}),
            }}
            onClick={() => {
              if (selectedIds.length === 0) return;
              setDeleteTargetIds(selectedIds);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </button>

          <div style={styles.bulkText}>
            {selectedIds.length} selected
          </div>
        </div>
      )}

      {showDeleteModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <div style={styles.modalTitle}>Delete Confirmation</div>

      <div style={styles.modalSubtitle}>
        {isPaid ? (
          <>
            This will move the selected item(s) to Trash.
            They can be restored within 30 days.
          </>
        ) : (
          <>
            This will permanently delete the selected item(s).
            This cannot be undone.
          </>
        )}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
          }}
          style={styles.modalSecondaryButton}
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmDelete}
          style={{
            ...styles.modalButton,
            background: "#dc2626",
            boxShadow: "none",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      {/* FLOATING UPLOAD BUTTON */}
      {folderId && !selectMode && (
  <UploadFab defaultFolderId={folderId} />
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
    columnCount: 4,
    columnGap: 8,
  },

  tileWrap: {
    breakInside: "avoid",
    marginBottom: 8,
    position: "relative",
  },

  tile: {
    display: "block",
    borderRadius: 12,
    overflow: "hidden",
    textDecoration: "none",
  },

  tileImg: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  tileSelected: {
  outline: "3px solid rgba(37,99,235,0.65)",
  outlineOffset: 0,
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

backButton: {
  background: "transparent",
  border: "none",
  fontSize: 28,
  cursor: "pointer",
  fontWeight: 900,
  color: "var(--text)",
  padding: "4px 6px",
  lineHeight: 1,
},

selectButton: {
  background: "transparent",
  border: "none",
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
  color: "#2563eb",
},

headerWrap: {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  paddingTop: 10,
  paddingBottom: 18,
},

headerLeft: {
  justifySelf: "start",
},

headerCenter: {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
},

headerRight: {
  justifySelf: "end",
},

albumTitle: {
  fontSize: 22,
  fontWeight: 900,
  letterSpacing: "-0.5px",
  color: "var(--text)",
},

albumShared: {
  marginTop: 4,
  fontSize: 13,
  color: "var(--muted)",
  fontWeight: 600,
},
};