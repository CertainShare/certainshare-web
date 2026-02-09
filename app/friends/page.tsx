"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import Link from "next/link";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const f = await apiFetch("/friends/list");
      const inc = await apiFetch("/friends/incoming");
      const out = await apiFetch("/friends/outgoing");

      setFriends(f.friends || []);
      setIncoming(inc.incoming || []);
      setOutgoing(out.outgoing || []);
    } catch (err: any) {
      setError(err.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }

  async function accept(userId: string) {
    try {
      await apiFetch("/friends/accept", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function reject(userId: string) {
    try {
      await apiFetch("/friends/reject", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      await loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function remove(userId: string) {
    const ok = confirm("Remove this friend?");
    if (!ok) return;

    try {
      await apiFetch("/friends/remove", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

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
            <h1 style={styles.title}>Friends</h1>
            <div style={styles.subtitle}>
              Manage your friend list and requests.
            </div>
          </div>
        </div>

        {loading && <p style={styles.statusText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && (
          <>
            {/* INCOMING */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Incoming Requests</div>
                <span style={styles.countBadge}>{incoming.length}</span>
              </div>

              {incoming.length === 0 ? (
                <p style={styles.muted}>No incoming requests.</p>
              ) : (
                incoming.map((r) => (
                  <div key={r.id} style={styles.row}>
                    <div style={styles.userBlock}>
                      <div style={styles.avatarCircle}>
                        {(r.display_name || r.id || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div style={styles.username}>
                          {r.display_name || r.id}
                        </div>
                        <div style={styles.userMeta}>Incoming request</div>
                      </div>
                    </div>

                    <div style={styles.actions}>
                      <button
                        onClick={() => accept(r.id)}
                        style={styles.primaryButton}
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => reject(r.id)}
                        style={styles.grayButton}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* OUTGOING */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Outgoing Requests</div>
                <span style={styles.countBadge}>{outgoing.length}</span>
              </div>

              {outgoing.length === 0 ? (
                <p style={styles.muted}>No outgoing requests.</p>
              ) : (
                outgoing.map((r) => (
                  <div key={r.id} style={styles.row}>
                    <div style={styles.userBlock}>
                      <div style={styles.avatarCircleMuted}>
                        {(r.display_name || r.id || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div style={styles.username}>
                          {r.display_name || r.id}
                        </div>
                        <div style={styles.userMeta}>Pending approval</div>
                      </div>
                    </div>

                    <span style={styles.pendingBadge}>Pending</span>
                  </div>
                ))
              )}
            </div>

            {/* FRIEND LIST */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Your Friends</div>
                <span style={styles.countBadge}>{friends.length}</span>
              </div>

              {friends.length === 0 ? (
                <p style={styles.muted}>No friends yet.</p>
              ) : (
                friends.map((f) => (
                  <div key={f.id} style={styles.row}>
                    <div style={styles.userBlock}>
                      <div style={styles.avatarCircle}>
                        {(f.display_name || f.id || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div style={styles.username}>
                          {f.display_name || f.id}
                        </div>
                        <div style={styles.userMeta}>Friend</div>
                      </div>
                    </div>

                    <button
                      onClick={() => remove(f.id)}
                      style={styles.grayButton}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
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

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
  },

  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontWeight: 600,
  },

  section: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontWeight: 800,
    fontSize: 14,
    color: "var(--text)",
  },

  countBadge: {
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.04)",
    color: "var(--text)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    gap: 12,
    flexWrap: "wrap",
  },

  userBlock: {
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

  avatarCircleMuted: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "rgba(15,23,42,0.05)",
    border: "1px solid rgba(15,23,42,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#475569",
    fontSize: 14,
    flexShrink: 0,
  },

  username: {
    fontWeight: 800,
    fontSize: 14,
    color: "var(--text)",
  },

  userMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "var(--muted2)",
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  muted: {
    color: "var(--muted)",
    fontSize: 14,
  },

  primaryButton: {
    background: "var(--primary)",
    color: "white",
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(37,99,235,0.4)",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    boxShadow: "0px 10px 20px rgba(37,99,235,0.15)",
  },

  grayButton: {
    background: "rgba(15,23,42,0.04)",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },

  pendingBadge: {
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
    color: "#475569",
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
};