"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

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
    <main style={{ padding: 30, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Edit Profile</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/profile">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}

      {!loading && (
        <form onSubmit={saveProfile} style={{ marginTop: 20 }}>
          {/* Profile Photo */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 18,
              background: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src={
                  profilePhotoUrl ||
                  "https://www.gravatar.com/avatar/?d=mp&s=200"
                }
                alt="Profile"
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 999,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: "bold" }}>
                  {displayName || "Your Profile"}
                </div>

                <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                  Choose a profile picture from your uploads or upload a new
                  image.
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "white",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    {showPicker ? "Close" : "Choose from uploads"}
                  </button>

                  <label
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #ccc",
                      cursor: "pointer",
                      background: "white",
                      fontWeight: "bold",
                      fontSize: 13,
                      display: "inline-block",
                    }}
                  >
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
                  <p style={{ fontSize: 13, color: "#666" }}>
                    No uploads available.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {uploads.map((u) => (
                      <img
                        key={u.id}
                        src={u.url}
                        alt="upload"
                        onClick={() => {
                          setProfilePhotoUrl(u.url);
                          setShowPicker(false);
                        }}
                        style={{
                          width: "100%",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 10,
                          cursor: "pointer",
                          border:
                            profilePhotoUrl === u.url
                              ? "3px solid #2563eb"
                              : "1px solid #ddd",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div
            style={{
              marginTop: 16,
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 18,
              background: "white",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: "bold" }}>
              Profile details
            </h2>

            <label style={labelStyle}>Display name</label>
<input
  value={displayName}
  onChange={(e) => setDisplayName(e.target.value)}
  placeholder="Your name"
  style={inputStyle}
  required
/>

<label style={labelStyle}>
  Bio <span style={{ fontWeight: "normal", color: "#999" }}>(optional)</span>
</label>
<textarea
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  placeholder="Write something short..."
  style={{
    ...inputStyle,
    minHeight: 90,
    resize: "vertical",
  }}
/>

            {/* Privacy toggle */}
            <label style={labelStyle}>Privacy</label>

            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 10,
                padding: 6,
                borderRadius: 999,
                border: "1px solid #ccc",
                width: "fit-content",
                background: "#f8f8f8",
              }}
            >
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  background: !isPrivate ? "#2563eb" : "transparent",
                  color: !isPrivate ? "white" : "#333",
                }}
              >
                Public
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  background: isPrivate ? "#2563eb" : "transparent",
                  color: isPrivate ? "white" : "#333",
                }}
              >
                Private
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#fafafa",
                fontSize: 13,
                color: "#444",
                lineHeight: "18px",
              }}
            >
              {!isPrivate ? (
                <span>
                  <b>Public:</b> Anyone in CertainShare will be able to view uploads
                  you post as <b>public</b> when viewing your profile.
                </span>
              ) : (
                <span>
                  <b>Private:</b> All uploads are hidden from non-friends within
                  CertainShare when viewing your profile.
                </span>
              )}
            </div>
          </div>

{successMessage && (
  <div
    style={{
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      background: "#dcfce7",
      border: "1px solid #86efac",
      color: "#166534",
      fontSize: 13,
      fontWeight: "bold",
    }}
  >
    {successMessage}
  </div>
)}

          {error && (
            <p style={{ marginTop: 14, fontSize: 13, color: "red" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 18,
              width: "100%",
              padding: 12,
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: "bold",
              background: "#2563eb",
              color: "white",
              border: "none",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 14,
  marginBottom: 6,
  fontSize: 13,
  fontWeight: "bold",
  color: "#666",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 15,
};