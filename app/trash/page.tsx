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
    // Select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  function toggleSelected(id: string) {
  setSelectedIds((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
}

async function handleBulkRestore() {
  if (selectedIds.length === 0) return;

  try {
    for (const id of selectedIds) {
      await apiFetch(`/media/${id}/restore`, { method: "POST" });
    }

    setSelectedIds([]);
    setSelectMode(false);
    await loadTrash();
  } catch (err: any) {
    alert(err.message || "Restore failed.");
  }
}

async function handleBulkDeletePermanent() {
  if (selectedIds.length === 0) return;
  setShowDeleteModal(true);
}

async function confirmPermanentDelete() {
  try {
    for (const id of selectedIds) {
      await apiFetch(`/media/${id}/permanent`, { method: "DELETE" });
    }

    setShowDeleteModal(false);
    setSelectedIds([]);
    setSelectMode(false);
    await loadTrash();
  } catch (err: any) {
    alert(err.message || "Delete failed.");
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
              {!selectMode && items.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  style={styles.backButton}
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
                  style={styles.backButton}
                >
                  Cancel
                </button>
              )}
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
              <div
                  key={item.id}
                  onClick={() => {
                    if (selectMode) {
                      toggleSelected(item.id);
                    }
                  }}
                  style={{
                    ...styles.card,
                    ...(selectedIds.includes(item.id) ? styles.tileSelected : {}),
                    cursor: selectMode ? "pointer" : "default",
                  }}
                >
                  <div style={styles.imageBox}>
                    <img src={item.url} alt="trash" style={styles.image} />

                    <div style={styles.deletedBadge}>
                      Deleted{" "}
                      {item.deleted_at
                        ? new Date(item.deleted_at).toLocaleDateString()
                        : ""}
                    </div>

                    {selectMode && (
                      <div style={styles.checkCircle}>
                        {selectedIds.includes(item.id) ? "✓" : ""}
                      </div>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
      {selectMode && (
  <div style={styles.bulkBar}>
    <button
      disabled={selectedIds.length === 0}
      style={{
        ...styles.bulkRestoreButton,
        ...(selectedIds.length === 0 ? styles.bulkDisabled : {}),
      }}
      onClick={handleBulkRestore}
    >
      Restore
    </button>

    <button
      disabled={selectedIds.length === 0}
      style={{
        ...styles.bulkDeleteButton,
        ...(selectedIds.length === 0 ? styles.bulkDisabled : {}),
      }}
      onClick={handleBulkDeletePermanent}
    >
      Delete Forever
    </button>

    <div style={styles.bulkText}>
      {selectedIds.length} selected
    </div>
  </div>
)}

{showDeleteModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <div style={styles.modalTitle}>
        Permanently delete media?
      </div>

      <div style={styles.modalBody}>
        This action cannot be undone.
        <br /><br />
        The selected media will be permanently removed and will no longer
        be recoverable.
        <br /><br />
        It may remain in encrypted system backups for a limited time
        for compliance, fraud prevention, or legal requirements,
        but it will not be accessible to you or any other user.
      </div>

      <div style={styles.modalActions}>
        <button
          onClick={() => setShowDeleteModal(false)}
          style={styles.modalCancel}
        >
          Cancel
        </button>

        <button
          onClick={confirmPermanentDelete}
          style={styles.modalDelete}
        >
          Permanently Delete
        </button>
      </div>
    </div>
  </div>
)}
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
  gap: 12,
  alignItems: "center",
  zIndex: 9999,
  boxShadow: "0px -10px 30px rgba(0,0,0,0.10)",
},

bulkText: {
  fontWeight: 900,
  fontSize: 14,
  color: "var(--text)",
},

bulkRestoreButton: {
  padding: "10px 16px",
  borderRadius: 12,
  cursor: "pointer",
  border: "1px solid rgba(37,99,235,0.25)",
  background: "rgba(37,99,235,0.10)",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 13,
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

bulkDisabled: {
  opacity: 0.5,
  cursor: "not-allowed",
},

modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
},

modalCard: {
  width: 420,
  background: "white",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0px 30px 60px rgba(0,0,0,0.25)",
},

modalTitle: {
  fontSize: 18,
  fontWeight: 950,
  marginBottom: 14,
},

modalBody: {
  fontSize: 14,
  lineHeight: "20px",
  color: "var(--text)",
},

modalActions: {
  marginTop: 24,
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
},

modalCancel: {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
},

modalDelete: {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(220,38,38,0.25)",
  background: "#dc2626",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
},
};