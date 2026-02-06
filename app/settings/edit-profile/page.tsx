"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

type Upload = {
  id: string;
  url: string;
};

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  async function loadMe() {
    const me = await apiFetch("/users/me");

    setDisplayName(me.display_name || "");
    setBio(me.bio || "");
    setProfilePhotoUrl(me.profile_photo_url || "");
    setIsPrivate(!!me.is_private);
  }

  async function loadUploads() {
    const res = await apiFetch("/media/my");
    setUploads(res || []);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");

    try {
      await loadMe();
      await loadUploads();
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadNewProfilePhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    try {
      // 1) request signed URL
      const uploadMeta = await apiFetch("/media/upload-url", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          folder_id: null,
          session_id: null,
        }),
      });

      const { uploadId, uploadUrl } = uploadMeta;

      // 2) upload to S3
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-amz-server-side-encryption": "AES256",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("S3 upload failed");
      }

      // 3) confirm upload
      const confirmRes = await apiFetch("/media/confirm", {
        method: "POST",
        body: JSON.stringify({
          uploadId,
          original_name: file.name,
          visibility: "private",
          mobile_only: false,
          note: null,
        }),
      });

      const media = confirmRes.media;
      if (!media) throw new Error("Confirm failed");

      // 4) use backend-provided url
      const mediaUrl = media.url;
      if (!mediaUrl) throw new Error("No media.url returned from backend");

      // 5) set preview photo
      setProfilePhotoUrl(mediaUrl);

      setSuccessMessage("Photo uploaded. Click Save changes to apply.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      setError(err.message || "Failed to upload profile photo");
    } finally {
      e.target.value = "";
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: displayName,
          bio: bio,
          profile_photo_url: profilePhotoUrl,
          is_private: isPrivate,
        }),
      });

      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    refreshAll();
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Edit Profile</h1>
            <div style={styles.subtitle}>
              Update your name, profile photo, and privacy settings.
            </div>
          </div>

          <div style={styles.headerActions}>
            <Link href="/settings" style={styles.backButton}>
              ← Back
            </Link>

            <Link href="/logout" style={styles.logoutButton}>
              Logout
            </Link>
          </div>
        </div>

        {loading && <div style={styles.centerText}>Loading...</div>}

        {!loading && (
          <form onSubmit={saveProfile} style={{ marginTop: 18 }}>
            {/* PHOTO CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Profile photo</div>
                <div style={styles.cardHint}>
                  Choose from existing uploads or upload a new photo.
                </div>
              </div>

              <div style={styles.photoRow}>
                <img
                  src={
                    profilePhotoUrl ||
                    "https://www.gravatar.com/avatar/?d=mp&s=200"
                  }
                  alt="Profile"
                  style={styles.avatar}
                />

                <div style={{ flex: 1 }}>
                  <div style={styles.displayNamePreview}>
                    {displayName || "Your profile"}
                  </div>

                  <div style={styles.photoSubText}>
                    Recommended: square image, 500×500 or larger.
                  </div>

                  <div style={styles.photoButtons}>
                    <button
                      type="button"
                      onClick={() => setShowPicker(!showPicker)}
                      style={{
                        ...styles.secondaryButton,
                        ...(showPicker ? styles.secondaryButtonActive : {}),
                      }}
                    >
                      {showPicker ? "Close picker" : "Choose from uploads"}
                    </button>

                    <label style={styles.secondaryButton}>
                      Upload new
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleUploadNewProfilePhoto(e)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {showPicker && (
                <div style={{ marginTop: 16 }}>
                  {uploads.length === 0 ? (
                    <div style={styles.emptyUploads}>
                      No uploads available yet.
                    </div>
                  ) : (
                    <div style={styles.uploadGrid}>
                      {uploads.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            ...styles.uploadThumbWrap,
                            ...(profilePhotoUrl === u.url
                              ? styles.uploadThumbActive
                              : {}),
                          }}
                          onClick={() => {
                            setProfilePhotoUrl(u.url);
                            setShowPicker(false);
                          }}
                        >
                          <img
                            src={u.url}
                            alt="upload"
                            style={styles.uploadThumb}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DETAILS CARD */}
            <div style={{ ...styles.card, marginTop: 14 }}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Profile details</div>
                <div style={styles.cardHint}>
                  This information appears on your profile inside CertainShare.
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Bio{" "}
                  <span style={{ fontWeight: 700, color: "var(--muted2)" }}>
                    (optional)
                  </span>
                </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something short..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Privacy</label>

                <div style={styles.privacyToggle}>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    style={{
                      ...styles.privacyButton,
                      ...(!isPrivate ? styles.privacyButtonActive : {}),
                    }}
                  >
                    Public
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    style={{
                      ...styles.privacyButton,
                      ...(isPrivate ? styles.privacyButtonActive : {}),
                    }}
                  >
                    Private
                  </button>
                </div>

                <div style={styles.privacyExplain}>
                  {!isPrivate ? (
                    <span>
                      <b>Public:</b> Your profile can be viewed inside
                      CertainShare. Only content marked <b>public</b> will show
                      to non-friends.
                    </span>
                  ) : (
                    <span>
                      <b>Private:</b> Your profile stays hidden from non-friends
                      inside CertainShare.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SUCCESS / ERROR */}
            {successMessage && (
              <div style={styles.successBox}>{successMessage}</div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}

            {/* SAVE */}
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.primaryButton,
                ...(saving ? styles.primaryButtonDisabled : {}),
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
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
    marginBottom: 10,
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
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
    maxWidth: 650,
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

  card: {
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    padding: 18,
    boxShadow: "var(--shadow-md)",
  },

  cardHeader: {
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.3px",
  },

  cardHint: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  photoRow: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 999,
    objectFit: "cover",
    border: "1px solid rgba(15,23,42,0.12)",
    boxShadow: "0px 10px 22px rgba(15,23,42,0.10)",
  },

  displayNamePreview: {
    fontSize: 16,
    fontWeight: 950,
    color: "var(--text)",
  },

  photoSubText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
  },

  photoButtons: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
    textDecoration: "none",
    boxShadow: "var(--shadow-sm)",
  },

  secondaryButtonActive: {
    border: "1px solid rgba(37,99,235,0.35)",
    boxShadow: "0px 14px 32px rgba(37,99,235,0.12)",
  },

  emptyUploads: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    color: "var(--muted)",
    fontWeight: 800,
    fontSize: 13,
  },

  uploadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
    gap: 10,
  },

  uploadThumbWrap: {
    borderRadius: 14,
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "var(--shadow-sm)",
    transition: "transform 0.12s ease",
  },

  uploadThumbActive: {
    border: "3px solid rgba(37,99,235,0.65)",
  },

  uploadThumb: {
    width: "100%",
    height: 90,
    objectFit: "cover",
    display: "block",
  },

  field: {
    marginTop: 14,
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 950,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    fontSize: 14,
    fontWeight: 800,
    outline: "none",
    background: "white",
  },

  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    fontSize: 14,
    fontWeight: 800,
    outline: "none",
    background: "white",
    minHeight: 100,
    resize: "vertical",
    lineHeight: "20px",
  },

  privacyToggle: {
    marginTop: 8,
    display: "flex",
    gap: 8,
    background: "rgba(15,23,42,0.03)",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 999,
    padding: 6,
    width: "fit-content",
  },

  privacyButton: {
    padding: "9px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 13,
    background: "transparent",
    color: "var(--muted)",
  },

  privacyButtonActive: {
    background: "#2563eb",
    color: "white",
    boxShadow: "0px 12px 30px rgba(37,99,235,0.18)",
  },

  privacyExplain: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    background: "rgba(37,99,235,0.06)",
    border: "1px solid rgba(37,99,235,0.12)",
    fontSize: 13,
    color: "var(--text)",
    lineHeight: "18px",
    fontWeight: 750,
  },

  successBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#166534",
    fontWeight: 950,
    fontSize: 13,
  },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 950,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 16,
    width: "100%",
    padding: "13px 14px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    background: "#2563eb",
    color: "white",
    border: "none",
    boxShadow: "0px 18px 40px rgba(37,99,235,0.18)",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};