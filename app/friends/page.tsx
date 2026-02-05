"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";

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
        <h1 style={styles.title}>Friends</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* INCOMING */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                Incoming Requests ({incoming.length})
              </div>

              {incoming.length === 0 ? (
                <p style={styles.muted}>No incoming requests.</p>
              ) : (
                incoming.map((r) => (
  <div key={r.id} style={styles.row}>
    <span style={{ fontWeight: "bold" }}>{r.display_name || r.id}</span>

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
              <div style={styles.sectionTitle}>
                Outgoing Requests ({outgoing.length})
              </div>

              {outgoing.length === 0 ? (
                <p style={styles.muted}>No outgoing requests.</p>
              ) : (
                outgoing.map((r) => (
  <div key={r.id} style={styles.row}>
    <span style={{ fontWeight: "bold" }}>{r.display_name || r.id}</span>
    <span style={styles.muted}>Pending</span>
  </div>
))
              )}
            </div>

            {/* FRIEND LIST */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Your Friends ({friends.length})</div>

              {friends.length === 0 ? (
                <p style={styles.muted}>No friends yet.</p>
              ) : (
                friends.map((f) => (
  <div key={f.id} style={styles.row}>
    <span style={{ fontWeight: "bold" }}>{f.display_name || f.id}</span>

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

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  section: {
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0px",
    borderBottom: "1px solid #eee",
    gap: 12,
    flexWrap: "wrap",
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  muted: {
    color: "#666",
  },

  primaryButton: {
    background: "#2563eb",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  grayButton: {
    background: "#f3f4f6",
    color: "#111827",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    fontWeight: "bold",
  },
};