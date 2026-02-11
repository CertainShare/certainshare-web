"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import TopNav from "../../../components/TopNav";
import { useRouter } from "next/navigation";

type BlockedUser = {
  id: string;
  display_name: string | null;
  profile_photo_url: string | null;
  created_at: string;
};

export default function BlockedUsersPage() {
  const router = useRouter();

  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBlockedUsers() {
    const res = await apiFetch("/block/list");
    setBlocked(res.blocked || []);
  }

  async function unblockUser(userId: string) {
    const ok = confirm("Unblock this user?");
    if (!ok) return;

    try {
      await apiFetch("/block/unblock", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      await loadBlockedUsers();
    } catch (err: any) {
      alert(err.message || "Failed to unblock user");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        await loadBlockedUsers();
      } catch (err: any) {
        setError(err.message || "Failed to load blocked users");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        <div style={styles.backRow}>
          <button onClick={() => router.back()} style={styles.backButton}>
            ← Back
          </button>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Blocked Users</h1>
          <div style={styles.subtitle}>
            Manage people you have blocked. They cannot view your profile or
            content.
          </div>
        </div>

        {loading && <p style={styles.mutedText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && (
          <>
            {blocked.length === 0 ? (
              <div style={styles.emptyState}>
                You haven’t blocked anyone.
              </div>
            ) : (
              <div style={styles.cardList}>
                {blocked.map((u) => (
                  <div key={u.id} style={styles.row}>
                    <div style={styles.left}>
                      <img
                        src={
                          u.profile_photo_url ||
                          "https://www.gravatar.com/avatar/?d=mp&s=200"
                        }
                        alt="Profile"
                        style={styles.avatar}
                      />

                      <div>
                        <div style={styles.name}>
                          {u.display_name || "Unnamed User"}
                        </div>
                        <div style={styles.smallText}>Blocked</div>
                      </div>
                    </div>

                    <button
                      onClick={() => unblockUser(u.id)}
                      style={styles.unblockButton}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
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
    maxWidth: 750,
    margin: "0 auto",
    padding: 24,
    paddingBottom: 120,
  },

  backRow: {
    marginBottom: 16,
  },

  backButton: {
    background: "rgba(15,23,42,0.05)",
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    color: "var(--text)",
  },

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: 900,
    margin: 0,
    color: "var(--text)",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.4,
  },

  mutedText: {
    marginTop: 16,
    color: "var(--muted)",
    fontSize: 14,
    fontWeight: 600,
  },

  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontWeight: 700,
  },

  emptyState: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "white",
    fontWeight: 700,
    color: "var(--muted)",
    boxShadow: "var(--shadow-sm)",
  },

  cardList: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    objectFit: "cover",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
  },

  name: {
    fontWeight: 900,
    fontSize: 14,
    color: "var(--text)",
  },

  smallText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--muted)",
  },

  unblockButton: {
    background: "rgba(220,38,38,0.06)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#dc2626",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
  },
};