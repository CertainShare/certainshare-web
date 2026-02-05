"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

type MediaItem = {
  id: string;
  url: string;
};

export default function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [folderId, setFolderId] = useState<string | null>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlbumMedia(folderId: string) {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(`/folders/${folderId}/media`);
      setItems(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load album");
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Resolve params + check auth
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const resolvedParams = await params;
      setFolderId(resolvedParams.id);
    }

    init();
  }, [params]);

  // Step 2: Load album media once folderId is known
  useEffect(() => {
    if (!folderId) return;
    loadAlbumMedia(folderId);
  }, [folderId]);

  return (
    <main style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Album</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/mymedia">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 20, color: "#666" }}>No media in this album</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {items.map((item) => (
  <Link
    key={item.id}
    href={`/media/${item.id}`}
    style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      overflow: "hidden",
      display: "block",
    }}
  >
    <img
      src={item.url}
      alt="media"
      style={{ width: "100%", height: 140, objectFit: "cover" }}
    />
  </Link>
))}
        </div>
      )}
    </main>
  );
}