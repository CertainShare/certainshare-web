"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Folder = {
  id: string;
  name: string;
  visibility?: "private" | "public" | "custom";
  mobile_only?: boolean;
  shared_user_ids?: string[];
};

type FriendRow = {
  id: string;
  display_name?: string;
};

type FriendProfile = {
  id: string;
  display_name?: string;
};

type VisibilityMode = "private" | "public" | "custom";

type UploadMediaFlowProps = {
  defaultFolderId?: string | null;
  onClose: () => void;
};

export default function UploadMediaFlow({
  defaultFolderId = null,
  onClose,
}: UploadMediaFlowProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    defaultFolderId || null
  );

  const [visibility, setVisibility] = useState<VisibilityMode>("private");
  const [mobileOnly, setMobileOnly] = useState(false);

  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const [loadingFolders, setLoadingFolders] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSingle = files.length === 1;

  const selectedFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [selectedFolderId, folders]);

  const effectiveVisibility: VisibilityMode = selectedFolder
    ? (selectedFolder.visibility as VisibilityMode) || "private"
    : visibility;

  const effectiveMobileOnly: boolean = selectedFolder
    ? !!selectedFolder.mobile_only
    : mobileOnly;

  const effectiveSharedUserIds: string[] = selectedFolder
    ? selectedFolder.shared_user_ids || []
    : selectedFriendIds;

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function loadFolders() {
    setLoadingFolders(true);

    try {
      const res = await apiFetch("/folders");

      const cleaned: Folder[] = (res || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        visibility: (f.visibility as VisibilityMode) || "private",
        mobile_only: !!f.mobile_only,
        shared_user_ids: f.shared_user_ids || [],
      }));

      setFolders(cleaned);
    } catch (err) {
      console.error("Load folders failed:", err);
    } finally {
      setLoadingFolders(false);
    }
  }

  async function loadFriends() {
    setLoadingFriends(true);

    try {
      const res = await apiFetch("/friends/list");
      const friendRows: FriendRow[] = res?.friends || [];

      const cleaned = friendRows.map((f: any) => ({
        id: f.id,
        display_name: f.display_name || f.id,
      }));

      setFriends(cleaned);
    } catch (err) {
      console.error("Load friends failed:", err);
    } finally {
      setLoadingFriends(false);
    }
  }

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (
      effectiveVisibility === "custom" &&
      friends.length === 0 &&
      !loadingFriends
    ) {
      loadFriends();
    }
  }, [effectiveVisibility]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    if (!picked || picked.length === 0) return;

    setError("");
    setSuccess("");

    const arr = Array.from(picked);
    setFiles(arr);

    if (arr.length !== 1) {
      setNote("");
    }
  }

  function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async function uploadSingleFile(file: File, sessionId: string) {
    const uploadMeta = await apiFetch("/media/upload-url", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        folder_id: selectedFolderId || null,
        session_id: sessionId,
      }),
    });

    const uploadId = uploadMeta.uploadId;
    const uploadUrl = uploadMeta.uploadUrl;

    if (!uploadId || !uploadUrl) {
      throw new Error("Upload URL response missing uploadId/uploadUrl");
    }

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-amz-server-side-encryption": "AES256",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload file to storage");
    }

    const originalName =
      isSingle && note.trim().length > 0 ? note.trim() : file.name;

    const confirmBody: any = {
      uploadId,
      original_name: originalName,
      visibility: effectiveVisibility,
      mobile_only: effectiveMobileOnly,
      note: isSingle ? note.trim() || null : null,
      folder_id: selectedFolderId || null,
    };

    if (effectiveVisibility === "custom") {
      confirmBody.shared_user_ids = effectiveSharedUserIds;
      confirmBody.shared_group_ids = [];
    }

    await apiFetch("/media/confirm", {
      method: "POST",
      body: JSON.stringify(confirmBody),
    });
  }

  async function startUpload() {
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(0);

    const sessionId = generateSessionId();

    try {
      const total = files.length;
      let completed = 0;

      for (const file of files) {
        await uploadSingleFile(file, sessionId);

        completed++;
        const pct = Math.round((completed / total) * 100);
        setProgress(pct);
      }

      setSuccess("Upload complete.");
      setFiles([]);
      setNote("");
      setSelectedFriendIds([]);

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Media selection</div>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={onPickFiles}
          style={styles.fileInput}
        />

        <div style={styles.helperText}>
          Selected: <b>{files.length}</b> file{files.length === 1 ? "" : "s"}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Where is this being uploaded?</div>

        {loadingFolders ? (
          <div style={styles.helperText}>Loading folders...</div>
        ) : (
          <select
            value={selectedFolderId || ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedFolderId(v === "" ? null : v);
            }}
            style={styles.select}
          >
            <option value="">Uploads (not in folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}

        <div style={styles.helperText}>
          If you select a folder, the folder privacy settings override your selection.
        </div>
      </div>

      {isSingle && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Caption / Tagline</div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={70}
            placeholder="What is this moment?"
            style={styles.input}
          />

          <div style={styles.helperText}>{note.length}/70</div>
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Privacy settings</div>

        {selectedFolder ? (
          <div style={styles.lockBox}>
            <div style={{ fontWeight: 900 }}>
              Folder privacy is locked:{" "}
              <span style={{ color: "#2563eb" }}>{effectiveVisibility}</span>
            </div>

            {effectiveVisibility === "custom" &&
              effectiveSharedUserIds.length > 0 && (
                <div style={styles.helperText}>
                  Shared with {effectiveSharedUserIds.length} friend(s)
                </div>
              )}
          </div>
        ) : (
          <>
            <div style={styles.chipRow}>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                style={{
                  ...styles.chip,
                  ...(visibility === "private" ? styles.chipActive : {}),
                }}
              >
                Private
                <div style={styles.chipDesc}>Only you</div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("public")}
                style={{
                  ...styles.chip,
                  ...(visibility === "public" ? styles.chipActive : {}),
                }}
              >
                Public
                <div style={styles.chipDesc}>Visible to allowed viewers</div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("custom")}
                style={{
                  ...styles.chip,
                  ...(visibility === "custom" ? styles.chipActive : {}),
                }}
              >
                Custom
                <div style={styles.chipDesc}>Pick friends</div>
              </button>
            </div>

            {visibility === "custom" && (
              <div style={styles.customBox}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>
                  Share with friends
                </div>

                {loadingFriends ? (
                  <div style={styles.helperText}>Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div style={styles.helperText}>
                    You don’t have any friends yet.
                  </div>
                ) : (
                  <div style={styles.friendGrid}>
                    {friends.map((f) => {
                      const active = selectedFriendIds.includes(f.id);

                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFriend(f.id)}
                          style={{
                            ...styles.friendChip,
                            ...(active ? styles.friendChipActive : {}),
                          }}
                        >
                          {f.display_name || f.id}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Mobile-only</div>

        {selectedFolder ? (
          <div style={styles.lockBox}>
            <div style={{ fontWeight: 900 }}>
              Folder mobile-only is locked:{" "}
              <span style={{ color: "#2563eb" }}>
                {effectiveMobileOnly ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        ) : (
          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={mobileOnly}
              onChange={(e) => setMobileOnly(e.target.checked)}
            />
            <span style={{ fontWeight: 900 }}>Enable mobile-only</span>
          </label>
        )}

        <div style={styles.helperText}>
          Mobile-only uploads are only viewable on mobile.
        </div>
      </div>

      {uploading && (
        <div style={styles.progressWrap}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.helperText}>{progress}%</div>
        </div>
      )}

      {error && <div style={styles.errorBox}>Error: {error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <button
        onClick={startUpload}
        disabled={uploading || files.length === 0}
        style={{
          ...styles.primaryButton,
          ...(uploading || files.length === 0 ? styles.disabledButton : {}),
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: 950, fontSize: 13, marginBottom: 10, color: "var(--text)" },

  fileInput: {
    width: "100%",
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  select: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  helperText: { marginTop: 8, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 },

  chipRow: { display: "flex", gap: 10, flexWrap: "wrap" },

  chip: {
    flex: 1,
    minWidth: 160,
    padding: "12px 12px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    cursor: "pointer",
    fontWeight: 950,
    textAlign: "left",
  },

  chipActive: { border: "1px solid rgba(37,99,235,0.50)", background: "rgba(37,99,235,0.08)" },

  chipDesc: { marginTop: 4, fontSize: 12, fontWeight: 700, color: "var(--muted)" },

  customBox: {
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 14,
    background: "rgba(15,23,42,0.02)",
  },

  friendGrid: { display: "flex", flexWrap: "wrap", gap: 10 },

  friendChip: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.14)",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },

  friendChipActive: {
    border: "1px solid rgba(37,99,235,0.55)",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
  },

  toggleRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)" },

  lockBox: { padding: 14, borderRadius: 16, border: "1px solid rgba(15,23,42,0.12)", background: "rgba(15,23,42,0.02)" },

  progressWrap: { marginTop: 14 },

  progressBar: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    background: "rgba(15,23,42,0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "#2563eb",
    transition: "width 0.2s ease",
  },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  successBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#166534",
    fontWeight: 900,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    border: "1px solid rgba(37,99,235,0.40)",
    background: "#2563eb",
    color: "white",
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  disabledButton: {
    cursor: "not-allowed",
    opacity: 0.6,
    boxShadow: "none",
  },
};