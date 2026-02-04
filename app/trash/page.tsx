"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

type TrashItem = {
  id: string;
  url: string;
  deleted_at: string;
};

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrash() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/media/trash");
      setItems(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trash");
    } finally {
      setLoading(false);
    }
  }

  async function restoreItem(mediaId: string) {
    try {
      await apiFetch(`/media/${mediaId}/restore`, { method: "POST" });
      await loadTrash();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deletePermanent(mediaId: string) {
    const ok = confirm("Permanently delete this media? This cannot be undone.");
    if (!ok) return;

    try {
      await apiFetch(`/media/${mediaId}/permanent`, { method: "DELETE" });
      await loadTrash();
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

    loadTrash();
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Trash</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/mymedia">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 20, color: "#666" }}>Trash is empty</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <img
                src={item.url}
                alt="trash"
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />

              <div style={{ padding: 10 }}>
                <button
                  onClick={() => restoreItem(item.id)}
                  style={{ width: "100%", padding: 8, cursor: "pointer" }}
                >
                  Restore
                </button>

                <button
                  onClick={() => deletePermanent(item.id)}
                  style={{
                    width: "100%",
                    padding: 8,
                    cursor: "pointer",
                    marginTop: 8,
                    color: "red",
                  }}
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}