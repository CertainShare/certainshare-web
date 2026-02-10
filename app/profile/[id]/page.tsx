"use client";

import { use, useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import TopNav from "../../components/TopNav";
import UploadFab from "../../components/UploadFab";
import { useRouter } from "next/navigation";

type ProfileUser = {
  id: string;
  display_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  is_private: boolean;
  created_at: string;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("none");
  const [albums, setAlbums] = useState<any[]>([]);
const [tab, setTab] = useState<"albums" | "uploads">("uploads");


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    const res = await apiFetch(`/users/${id}/profile`);
    setProfile(res);
  }

  async function loadUploads() {
    const res = await apiFetch(`/users/${id}/uploads`);
    setUploads(res.uploads || []);
  }

  async function loadAlbums() {
  const res = await apiFetch(`/folders/user/${id}`);
  setAlbums(res || []);
}

  async function loadFriendStatus() {
    const res = await apiFetch(`/friends/status/${id}`);
    setStatus(res.status || "none");
  }

  async function sendRequest() {
    try {
      await apiFetch("/friends/request", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });

      await loadFriendStatus();
    } catch (err: any) {
      alert(err.message || "Failed to send request");
    }
  }

  async function cancelRequest() {
    try {
      await apiFetch("/friends/cancel", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });

      await loadFriendStatus();
    } catch (err: any) {
      alert(err.message || "Failed to cancel request");
    }
  }

  async function acceptRequest() {
    try {
      await apiFetch("/friends/accept", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });

      await loadFriendStatus();
    } catch (err: any) {
      alert(err.message || "Failed to accept request");
    }
  }

  async function removeFriend() {
    const ok = confirm("Remove this friend?");
    if (!ok) return;

    try {
      await apiFetch("/friends/remove", {
        method: "POST",
        body: JSON.stringify({ userId: id }),
      });

      await loadFriendStatus();
    } catch (err: any) {
      alert(err.message || "Failed to remove friend");
    }
  }

  async function refreshAll() {
    setLoading(true);
    setError("");

    try {
      await loadProfile();
      await loadFriendStatus();
      await loadUploads();
      await loadAlbums();
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    refreshAll();
  }, [id]);

  function renderFriendButton() {
    if (status === "friends") {
      return (
        <button onClick={removeFriend} style={styles.grayButton}>
          Remove Friend
        </button>
      );
    }

    if (status === "outgoing_pending") {
      return (
        <button onClick={cancelRequest} style={styles.grayButton}>
          Cancel Request
        </button>
      );
    }

    if (status === "incoming_pending") {
      return (
        <button onClick={acceptRequest} style={styles.primaryButton}>
          Accept Request
        </button>
      );
    }

    if (status === "blocked") {
      return <div style={styles.mutedText}>You blocked this user</div>;
    }

    if (status === "blocked_by_other") {
      return <div style={styles.mutedText}>You cannot view this user</div>;
    }

    return (
      <button onClick={sendRequest} style={styles.primaryButton}>
        Add Friend
      </button>
    );
  }

  return (
    <main style={styles.page}>
      <TopNav />

    <div style={styles.backRow}>
      <button onClick={() => router.back()} style={styles.backButton}>
        ← Back
      </button>
    </div>

      <div style={styles.container}>
        {loading && <p style={styles.mutedText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && profile && (
          <>
            <div style={styles.profileCard}>
              <div style={styles.banner} />

              <div style={styles.profileRow}>
                <div style={styles.profileLeft}>
                  <img
                    src={
                      profile.profile_photo_url ||
                      "https://www.gravatar.com/avatar/?d=mp&s=200"
                    }
                    alt="Profile"
                    style={styles.profileImage}
                  />

                  <div style={styles.profileText}>
                    <div style={styles.profileName}>
                      {profile.display_name || "Unnamed User"}
                    </div>

                    <div style={styles.profileBio}>
                      {profile.bio || "No bio yet."}
                    </div>

                    <div style={styles.privateTag}>
                      {profile.is_private ? "Private Profile" : "Public Profile"}
                    </div>
                  </div>
                </div>

                <div style={styles.profileActions}>{renderFriendButton()}</div>
              </div>
            </div>

            <div style={styles.section}>
            <div style={styles.tabRow}>
                <button
                style={tab === "albums" ? styles.tabActive : styles.tab}
                onClick={() => setTab("albums")}
                >
                Albums
                </button>

                <button
                style={tab === "uploads" ? styles.tabActive : styles.tab}
                onClick={() => setTab("uploads")}
                >
                Uploads
                </button>
            </div>

            <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>
                {tab === "albums" ? "Albums" : "Uploads"}
                </div>
                <span style={styles.countBadge}>
                {tab === "albums" ? albums.length : uploads.length}
                </span>
            </div>

                        {tab === "albums" ? (
            albums.length === 0 ? (
                <div style={styles.mutedText}>No albums found.</div>
            ) : (
                <div style={styles.gridUploads}>
                {albums.map((album) => (
                    <div key={album.id} style={styles.uploadCard}>
                    <div style={styles.albumThumb}>
                        {album.hero_uri ? (
                        <img
                            src={album.hero_uri}
                            alt="album"
                            style={styles.uploadImage}
                        />
                        ) : (
                        <div style={styles.emptyAlbum}>No Cover</div>
                        )}
                    </div>

                    <div style={styles.albumName}>{album.name || "Untitled Album"}</div>
                    </div>
                ))}
                </div>
            )
            ) : uploads.length === 0 ? (
            <div style={styles.mutedText}>No visible uploads from this user.</div>
            ) : (
            <div style={styles.gridUploads}>
                {uploads.map((upload) => (
                <div key={upload.id} style={styles.uploadCard}>
                    <img
                    src={
                        upload.url ||
                        upload.uri ||
                        upload.cloudfront_url ||
                        upload.signed_url
                    }
                    alt="upload"
                    style={styles.uploadImage}
                    />
                </div>
                ))}
            </div>
            )}
            </div>
          </>
        )}
      </div>

      <UploadFab />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
    overflowY: "auto",
  },

  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 24,
    paddingBottom: 120,
  },

backRow: {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "18px 24px 0px 24px",
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

  profileCard: {
    borderRadius: 22,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },

  banner: {
    height: 140,
    background:
      "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(147,51,234,1) 100%)",
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
    width: 92,
    height: 92,
    borderRadius: 999,
    objectFit: "cover",
    border: "4px solid white",
    marginTop: -55,
    boxShadow: "0px 10px 24px rgba(15,23,42,0.22)",
    background: "#eee",
  },

  profileText: {
    marginTop: -10,
  },

  profileName: {
    fontSize: 22,
    fontWeight: 850,
    letterSpacing: "-0.4px",
    color: "var(--text)",
  },

  profileBio: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--muted)",
    maxWidth: 520,
    lineHeight: 1.5,
  },

  privateTag: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 850,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.04)",
    border: "1px solid rgba(15,23,42,0.10)",
    color: "var(--text)",
    display: "inline-block",
  },

  profileActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  section: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },

  tabRow: {
  display: "flex",
  gap: 10,
  marginBottom: 14,
},

tab: {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(15,23,42,0.03)",
  fontWeight: 850,
  cursor: "pointer",
  color: "var(--text)",
},

tabActive: {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(37,99,235,0.35)",
  background: "rgba(37,99,235,0.12)",
  fontWeight: 900,
  cursor: "pointer",
  color: "#2563eb",
},

albumName: {
  padding: "10px 12px",
  fontWeight: 850,
  fontSize: 13,
  color: "var(--text)",
  borderTop: "1px solid rgba(15,23,42,0.06)",
},

emptyAlbum: {
  width: "100%",
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--muted)",
  fontWeight: 800,
  fontSize: 13,
},

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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

  gridUploads: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 14,
  },

  uploadCard: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid var(--border)",
    background: "white",
    boxShadow: "var(--shadow-md)",
  },

  uploadImage: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    display: "block",
  },

  mutedText: {
    color: "var(--muted)",
    fontSize: 14,
    fontWeight: 600,
  },

  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontWeight: 600,
  },

  primaryButton: {
    background: "var(--primary)",
    color: "white",
    padding: "10px 14px",
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
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },
};