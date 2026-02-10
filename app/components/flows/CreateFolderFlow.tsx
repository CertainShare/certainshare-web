"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";


type FriendRow = {
  id: string;
  display_name?: string;
};

type FriendProfile = {
  id: string;
  display_name?: string;
};

type VisibilityMode = "private" | "public" | "custom";

type CreateFolderFlowProps = {
  onClose: () => void;
};

export default function CreateFolderFlow({ onClose }: CreateFolderFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [visibility, setVisibility] = useState<VisibilityMode>("private");
  const [mobileOnly, setMobileOnly] = useState(false);

  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidStep1 = folderName.trim().length >= 2;
  const isValidStep2 = files.length > 0;

  function toggleFriend(id: string) {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
    if (visibility === "custom" && friends.length === 0 && !loadingFriends) {
      loadFriends();
    }
  }, [visibility]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    if (!picked || picked.length === 0) return;

    setFiles(Array.from(picked));
    setError("");
    setSuccess("");
  }

  function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async function uploadSingleFile(file: File, sessionId: string, folderId: string) {
    const uploadMeta = await apiFetch("/media/upload-url", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        folder_id: folderId,
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

    const confirmBody: any = {
      uploadId,
      original_name: file.name,
      visibility,
      mobile_only: mobileOnly,
      note: null,
      folder_id: folderId,
    };

    if (visibility === "custom") {
      confirmBody.shared_user_ids = selectedFriendIds;
      confirmBody.shared_group_ids = [];
    }

    await apiFetch("/media/confirm", {
      method: "POST",
      body: JSON.stringify(confirmBody),
    });
  }

  async function startCreateFolder() {
    if (!isValidStep1) {
      setError("Folder name is required.");
      return;
    }

    if (!isValidStep2) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(0);

    try {
      // 1) Create folder first
      const folderRes = await apiFetch("/folders", {
        method: "POST",
        body: JSON.stringify({
          name: folderName.trim(),
          visibility,
          mobile_only: mobileOnly,
          shared_user_ids: visibility === "custom" ? selectedFriendIds : [],
        }),
      });

      const folderId = folderRes?.folder?.id || folderRes?.id;

      if (!folderId) {
        throw new Error("Folder creation failed (missing folder id).");
      }

      // 2) Upload files
      const sessionId = generateSessionId();
      const total = files.length;
      let completed = 0;

      for (const file of files) {
        await uploadSingleFile(file, sessionId, folderId);

        completed++;
        const pct = Math.round((completed / total) * 100);
        setProgress(pct);
      }

      setSuccess("Folder created successfully.");
      setFiles([]);
      setFolderName("");
      setSelectedFriendIds([]);

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err: any) {
      console.error("Create folder upload error:", err);
      setError(err.message || "Folder creation failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* STEP INDICATOR */}
      <div style={styles.stepRow}>
        <div style={{ ...styles.stepChip, ...(step === 1 ? styles.stepActive : {}) }}>
          1. Name
        </div>
        <div style={{ ...styles.stepChip, ...(step === 2 ? styles.stepActive : {}) }}>
          2. Media
        </div>
        <div style={{ ...styles.stepChip, ...(step === 3 ? styles.stepActive : {}) }}>
          3. Privacy
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div style={styles.section}>
          <div style={styles.label}>Folder name</div>
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Family Vacation"
            maxLength={50}
            style={styles.input}
          />

          <button
            style={{ ...styles.primaryButton, ...(isValidStep1 ? {} : styles.disabledButton) }}
            disabled={!isValidStep1}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={styles.section}>
          <div style={styles.label}>Select media</div>

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

          <div style={styles.rowButtons}>
            <button style={styles.secondaryButton} onClick={() => setStep(1)}>
              Back
            </button>

            <button
              style={{
                ...styles.primaryButton,
                ...(isValidStep2 ? {} : styles.disabledButton),
              }}
              disabled={!isValidStep2}
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={styles.section}>
          <div style={styles.label}>Privacy</div>

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
                <div style={styles.helperText}>You don’t have any friends yet.</div>
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

          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={mobileOnly}
              onChange={(e) => setMobileOnly(e.target.checked)}
            />
            <span style={{ fontWeight: 900 }}>Mobile-only</span>
          </label>

          <div style={styles.helperText}>
            Mobile-only uploads are only viewable on mobile.
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

          <div style={styles.rowButtons}>
            <button style={styles.secondaryButton} onClick={() => setStep(2)}>
              Back
            </button>

            <button
              style={{
                ...styles.primaryButton,
                ...(uploading ? styles.disabledButton : {}),
              }}
              disabled={uploading}
              onClick={startCreateFolder}
            >
              {uploading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  stepRow: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  stepChip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    fontWeight: 900,
    fontSize: 13,
    background: "rgba(15,23,42,0.02)",
    color: "var(--muted)",
  },
  stepActive: {
    border: "1px solid rgba(37,99,235,0.45)",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
  },
  section: { paddingBottom: 10 },
  label: { fontWeight: 950, fontSize: 13, marginBottom: 10, color: "var(--text)" },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },
  fileInput: {
    width: "100%",
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
  },
  helperText: { marginTop: 8, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 },

  chipRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 },
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
  chipActive: {
    border: "1px solid rgba(37,99,235,0.50)",
    background: "rgba(37,99,235,0.08)",
  },
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

  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--text)",
    marginTop: 14,
  },

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

  rowButtons: {
    display: "flex",
    gap: 10,
    marginTop: 16,
  },

  primaryButton: {
    flex: 1,
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

  secondaryButton: {
    flex: 1,
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    color: "var(--text)",
  },

  disabledButton: {
    cursor: "not-allowed",
    opacity: 0.6,
    boxShadow: "none",
  },
};