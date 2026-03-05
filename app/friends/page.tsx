"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";
import Link from "next/link";
import UploadFab from "../components/UploadFab";
import { deriveBillingFlags, getClientBillingStatus } from "../../lib/billingGate";

type User = {
  id: string;
  display_name?: string;
  profile_photo_url?: string | null;
  is_private?: boolean;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([]);
  const [incoming, setIncoming] = useState<User[]>([]);
  const [outgoing, setOutgoing] = useState<User[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isFrozen, setIsFrozen] = useState<boolean | null>(null);

  useEffect(() => {
    const flags = deriveBillingFlags(getClientBillingStatus());
    setIsFrozen(flags.isFrozen);
  }, []);

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

  async function searchUsers(q: string) {
    if (isFrozen) return;

    const cleaned = q.trim();
    if (cleaned.length < 2) {
      setUserResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const res = await apiFetch(`/users/search?q=${encodeURIComponent(cleaned)}`);
      setUserResults(res.results || []);
    } catch (err) {
      console.error("Search users failed:", err);
    } finally {
      setSearchLoading(false);
    }
  }

  async function accept(userId: string) {
    await apiFetch("/friends/accept", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    await loadAll();
    await searchUsers(search);
  }

  async function reject(userId: string) {
    await apiFetch("/friends/reject", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    await loadAll();
    await searchUsers(search);
  }

  async function remove(userId: string) {
    if (!confirm("Remove this friend?")) return;

    await apiFetch("/friends/remove", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    await loadAll();
    await searchUsers(search);
  }

  async function sendRequest(userId: string) {
    await apiFetch("/friends/request", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    await loadAll();
    await searchUsers(search);
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

  function Avatar({ user }: { user: User }) {
    return (
      <div style={styles.avatarCircle}>
        {user.profile_photo_url ? (
          <img src={user.profile_photo_url} style={styles.avatarImage} />
        ) : (
          (user.display_name || user.id || "U").slice(0, 1).toUpperCase()
        )}
      </div>
    );
  }

  if (isFrozen === null) return null;

  return (
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        <h1 style={styles.title}>Friends</h1>

        {isFrozen && (
          <div style={styles.frozenBanner}>
            Account frozen — friend actions disabled.
          </div>
        )}

        {/* SEARCH */}
        <div style={styles.searchWrap}>
          <input
            value={search}
            disabled={isFrozen}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              searchUsers(val);
            }}
            placeholder="Search friends..."
            style={styles.searchInput}
          />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && (
          <>
            {/* FIND FRIENDS */}
            {search.length >= 2 && (
              <div style={styles.section}>
                <h3>Find Friends</h3>

                {searchLoading ? (
                  <p>Searching...</p>
                ) : (
                  userResults.map((u) => (
                    <div key={u.id} style={styles.row}>
                      <Link href={`/profile/${u.id}`} style={styles.userBlock}>
                        <Avatar user={u} />
                        <span>{u.display_name || u.id}</span>
                      </Link>

                      <button onClick={() => sendRequest(u.id)} style={styles.button}>
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* INCOMING */}
            <div style={styles.section}>
              <h3>Incoming Requests</h3>

              {incoming.map((r) => (
                <div key={r.id} style={styles.row}>
                  <Link href={`/profile/${r.id}`} style={styles.userBlock}>
                    <Avatar user={r} />
                    <span>{r.display_name || r.id}</span>
                  </Link>

                  <div style={styles.actions}>
                    <button onClick={() => accept(r.id)} style={styles.button}>
                      Accept
                    </button>

                    <button onClick={() => reject(r.id)} style={styles.grayButton}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* OUTGOING */}
            <div style={styles.section}>
              <h3>Outgoing Requests</h3>

              {outgoing.map((r) => (
                <div key={r.id} style={styles.row}>
                  <Link href={`/profile/${r.id}`} style={styles.userBlock}>
                    <Avatar user={r} />
                    <span>{r.display_name || r.id}</span>
                  </Link>

                  <span style={styles.pending}>Pending</span>
                </div>
              ))}
            </div>

            {/* FRIENDS */}
            <div style={styles.section}>
              <h3>Your Friends</h3>

              {friends.map((f) => (
              <div
                key={f.id}
                style={styles.row}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f6f8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
              >
                  <Link href={`/profile/${f.id}`} style={styles.userBlock}>
                    <Avatar user={f} />
                    <span>{f.display_name || f.id}</span>
                  </Link>

                  <button onClick={() => remove(f.id)} style={styles.grayButton}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <UploadFab />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "var(--bg)" },

  container: { maxWidth: 900, margin: "0 auto", padding: "16px 24px 24px 24px" },

  title: {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 12,
  letterSpacing: "-0.2px",
  color: "var(--text)",
},

  searchWrap: { marginBottom: 20 },

  searchInput: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
  },

  section: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    border: "1px solid var(--border)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.06)",
    background: "#f8fafc",
    marginBottom: 10,
  },

  userBlock: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "inherit",
  },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    overflow: "hidden",
    background: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  actions: { display: "flex", gap: 8 },

  button: {
    padding: "6px 12px",
    background: "#2563eb",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  grayButton: {
    padding: "6px 12px",
    background: "#eee",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  pending: { fontSize: 12, color: "#666" },

  frozenBanner: {
    background: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  rowHover: {
  background: "#f4f6f8",
},
};