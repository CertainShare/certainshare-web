"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import UploadFab from "../components/UploadFab";
import { useRouter } from "next/navigation";
import { deriveBillingFlags, getClientBillingStatus } from "../../lib/billingGate";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFrozen, setIsFrozen] = useState<boolean | null>(null);

useEffect(() => {
  const flags = deriveBillingFlags(getClientBillingStatus());
  setIsFrozen(flags.isFrozen);
}, []);

  const [showFrozenModal, setShowFrozenModal] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/notifications");
      const unread = await apiFetch("/notifications/unread-count");

      setNotifications(res.notifications || []);
      setUnreadCount(unread.count || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      await loadAll();
    } catch (err: any) {
      if (err?.message === "Account frozen") {
        setShowFrozenModal(true);
        return;
      }

      console.error("Failed to mark all read:", err);
    }
  }

  async function markOneRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      await loadAll();
    } catch (err: any) {
      if (err?.message === "Account frozen") {
        setShowFrozenModal(true);
        return;
      }

      console.error("Failed to mark notification read:", err);
    }
  }

  function getNotificationLink(n: any) {
    if (n.media_id) return `/media/${n.media_id}`;
    if (n.folder_id) return `/album/${n.folder_id}`;
    if (n.actor_id) return `/profile/${n.actor_id}`;
    return null;
  }

  async function handleNotificationClick(n: any) {
    const link = getNotificationLink(n);

    // mark read if needed
    if (!n.read_at) {
      try {
        await apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" });
      } catch (err: any) {
        if (err?.message === "Account frozen") {
          setShowFrozenModal(true);
          return;
        }
        console.error("Failed to mark notification read:", err);
      }
    }

    if (link) {
      router.push(link);
    } else {
      await loadAll();
    }
  }

    useEffect(() => {
      async function init() {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const me = await apiFetch("/users/me", { gateOnboarding: true });
        if (!me) return;

        await loadAll();
      }

      init();
    }, []);

    if (isFrozen === null) {
  return null;
}

  return (
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <div style={styles.subtitle}>
              Friend requests, shares, and activity updates.
            </div>
          </div>

          <div style={styles.headerActions}>
            <span style={styles.unreadBadge}>{unreadCount} unread</span>
            <button
              disabled={isFrozen}
              onClick={markAllRead}
              style={{
                ...styles.button,
                ...(isFrozen ? { opacity: 0.5, cursor: "not-allowed" } : {}),
              }}
            >
              Mark all read
            </button>
          </div>
        </div>
        {isFrozen && (
          <div style={styles.frozenBanner}>
            Account frozen — notification actions are disabled. Manage billing to restore access.
          </div>
        )}

        {loading && <p style={styles.statusText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && notifications.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No notifications</div>
            <div style={styles.emptySub}>
              You’ll see friend requests, shares, and activity here.
            </div>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (isFrozen) return;
                  handleNotificationClick(n);
                }}
                style={{
                  ...styles.card,
                  ...(n.read_at ? {} : styles.unreadCard),
                  cursor:
                    isFrozen
                      ? "default"
                      : getNotificationLink(n)
                      ? "pointer"
                      : "default",
                  ...(isFrozen ? { opacity: 0.85 } : {}),
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.userRow}>
                    <div style={styles.avatarCircle}>
                      {(n.actor_display_name || "S")
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div style={styles.username}>
                        {n.actor_display_name || "Someone"}
                      </div>
                      <div style={styles.timestamp}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.read_at && <span style={styles.newBadge}>New</span>}
                </div>

                <div style={styles.message}>{n.message}</div>

                <div style={styles.metaRow}>
                  <div />

                  {!n.read_at && (
                    <button
                      disabled={isFrozen}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFrozen) return;
                        markOneRead(n.id);
                      }}
                      style={{
                        ...styles.smallButton,
                        ...(isFrozen
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {}),
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFrozenModal && (
        <div
          style={styles.modalBackdrop}
          onMouseDown={() => setShowFrozenModal(false)}
        >
          <div
            style={styles.modalCard}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Account Frozen</h3>

            <p style={{ fontSize: 14, marginTop: 0, marginBottom: 16 }}>
              Your account is currently frozen. Notification actions are disabled
              until billing is resolved.
            </p>

            <div style={styles.modalActions}>
              <button
                style={styles.modalSecondary}
                onClick={() => setShowFrozenModal(false)}
              >
                Close
              </button>

              <button
                style={styles.modalPrimary}
                onClick={() => router.push("/settings/billing")}
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      )}

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
    flexWrap: "wrap",
    gap: 14,
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

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  unreadBadge: {
    background: "rgba(15,23,42,0.06)",
    color: "#0f172a",
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
    border: "1px solid rgba(15,23,42,0.10)",
  },

  button: {
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    fontWeight: 800,
    fontSize: 13,
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
    background: "white",
    border: "1px solid var(--border)",
    padding: 14,
    marginBottom: 12,
    boxShadow: "var(--shadow-md)",
  },

  unreadCard: {
    border: "1px solid rgba(37,99,235,0.35)",
    background: "rgba(37,99,235,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    flexShrink: 0,
  },

  username: {
    fontWeight: 800,
    fontSize: 14,
    color: "var(--text)",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 12,
    color: "var(--muted2)",
  },

  newBadge: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(37,99,235,0.25)",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
    whiteSpace: "nowrap",
  },

  message: {
    marginTop: 12,
    fontSize: 14,
    color: "var(--text)",
    lineHeight: 1.5,
  },

  metaRow: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallButton: {
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    border: "1px solid rgba(37,99,235,0.18)",
    background: "rgba(37,99,235,0.06)",
    fontWeight: 800,
    fontSize: 13,
    color: "var(--primary)",
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

  frozenBanner: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.25)",
    color: "#991b1b",
    fontWeight: 800,
    fontSize: 13,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    background: "white",
    padding: 24,
    borderRadius: 18,
    width: 340,
    textAlign: "center",
    boxShadow: "0px 22px 60px rgba(0,0,0,0.20)",
    border: "1px solid rgba(15,23,42,0.10)",
  },

  modalActions: {
    display: "flex",
    gap: 10,
  },

  modalPrimary: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  modalSecondary: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.15)",
    background: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
};