"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Props = {
  type: "media" | "album";
  targetId: string;
  initialVisibility: "private" | "public" | "custom";
  onClose: () => void;
  onSaved: () => void;
};

export default function EditAccessModal({
  type,
  targetId,
  initialVisibility,
  onClose,
  onSaved,
}: Props) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);

        useEffect(() => {
        loadCurrentShares();
        searchUsers(""); // Load all friends immediately
        }, []);

  async function loadCurrentShares() {
    try {
        const endpoint =
        type === "media"
            ? `/media/${targetId}/sharing`
            : `/folders/${targetId}/sharing`;

      const res = await apiFetch(endpoint);
      setSharedUsers(res || []);
    } catch {
      setSharedUsers([]);
    }
  }

    async function searchUsers(query: string) {
    try {
        const res = await apiFetch(
        `/users/friends/search?q=${encodeURIComponent(query)}`
        );

        setSearchResults(res.results || []);
    } catch {
        setSearchResults([]);
    }
    }

  async function handleSave() {
    setLoading(true);
    setError("");

    try {
    const endpoint =
    type === "media"
        ? `/media/${targetId}/sharing`
        : `/folders/${targetId}/sharing`;

      await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({
          visibility,
        }),
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={title}>Edit Access</div>

        <div style={section}>
          <label style={label}>Visibility</label>

          <div style={toggleRow}>
            {["private", "public", "custom"].map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v as any)}
                style={{
                  ...toggleButton,
                  ...(visibility === v ? toggleActive : {}),
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {visibility === "custom" && (
          <div style={section}>
            <label style={label}>Share with users</label>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search users..."
              style={input}
            />

            <div style={{ marginTop: 8 }}>
              {searchResults.map((u) => (
                <div key={u.id} style={userRow}>
                  <span>{u.display_name || u.email}</span>
                  <button
                    onClick={() => {
                      // We'll wire this next
                    }}
                    style={addButton}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Shared With
              </div>

              {sharedUsers.map((u) => (
                <div key={u.id} style={userRow}>
                  <span>{u.display_name || u.email}</span>
                  <button style={removeButton}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div style={errorStyle}>{error}</div>}

        <div style={buttonRow}>
          <button onClick={onClose} style={secondaryBtn}>
            Cancel
          </button>

          <button onClick={handleSave} style={primaryBtn}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- styles --- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "white",
  borderRadius: 20,
  padding: 20,
};

const title = {
  fontSize: 18,
  fontWeight: 900,
};

const section = {
  marginTop: 16,
};

const label = {
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 6,
  display: "block",
};

const toggleRow = {
  display: "flex",
  gap: 8,
};

const toggleButton: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.15)",
  background: "white",
  cursor: "pointer",
};

const toggleActive: React.CSSProperties = {
  background: "rgba(37,99,235,0.12)",
  border: "1px solid rgba(37,99,235,0.6)",
  color: "#2563eb",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.15)",
};

const userRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 6,
};

const addButton: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};

const removeButton: React.CSSProperties = {
  background: "rgba(220,38,38,0.1)",
  color: "#dc2626",
  border: "1px solid rgba(220,38,38,0.4)",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};

const buttonRow: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  gap: 10,
};

const primaryBtn: React.CSSProperties = {
  flex: 1,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "12px",
  cursor: "pointer",
  fontWeight: 900,
};

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  background: "white",
  border: "1px solid rgba(15,23,42,0.15)",
  borderRadius: 14,
  padding: "12px",
  cursor: "pointer",
  fontWeight: 900,
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#dc2626",
  fontWeight: 800,
};