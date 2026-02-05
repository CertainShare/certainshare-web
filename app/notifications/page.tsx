"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../../components/TopNav";

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
          <h1 style={styles.title}>Notifications</h1>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={styles.unreadBadge}>{unreadCount} unread</span>

            <button onClick={markAllRead} style={styles.button}>
              Mark all read
            </button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && notifications.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>No notifications</div>
            <div style={styles.emptySub}>
              You’ll see friend requests, shares, and activity here.
            </div>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  ...styles.card,
                  ...(n.read_at ? {} : styles.unreadCard),
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {n.actor_display_name || "Someone"}
                </div>

                <div style={{ marginTop: 6 }}>{n.message}</div>

                <div style={styles.metaRow}>
                  <div style={styles.timestamp}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>

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
    flexWrap: "wrap",
    gap: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  unreadBadge: {
    background: "#111827",
    color: "white",
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: "bold",
    fontSize: 12,
  },

  button: {
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
    marginBottom: 12,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
  },

  unreadCard: {
    border: "2px solid #2563eb",
  },

  metaRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timestamp: {
    fontSize: 12,
    color: "#666",
  },

  smallButton: {
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "white",
    fontWeight: "bold",
    fontSize: 12,
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