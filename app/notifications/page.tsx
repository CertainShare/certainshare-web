"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      alert(err.message);
    }
  }

  async function markOneRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadAll();
  }, []);

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

            <button onClick={markAllRead} style={styles.button}>
              Mark all read
            </button>
          </div>
        </div>

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
                style={{
                  ...styles.card,
                  ...(n.read_at ? {} : styles.unreadCard),
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
                      onClick={() => markOneRead(n.id)}
                      style={styles.smallButton}
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
};