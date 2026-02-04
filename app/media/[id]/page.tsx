"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";

type UploadItem = {
  id: string;
  url: string;
  visibility: string;
};

export default function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [mediaId, setMediaId] = useState<string | null>(null);

  const [item, setItem] = useState<UploadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMediaFromList(mediaId: string) {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/media/my");

      const found = (res || []).find((x: any) => x.id === mediaId);

      if (!found) {
        throw new Error("Media not found");
      }

      setItem(found);
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const resolvedParams = await params;
      setMediaId(resolvedParams.id);
    }

    init();
  }, [params]);

  useEffect(() => {
    if (!mediaId) return;
    loadMediaFromList(mediaId);
  }, [mediaId]);

  return (
    <main style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Media</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/mymedia">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && item && (
        <div style={{ marginTop: 20 }}>
          <img
            src={item.url}
            alt="media"
            style={{
              width: "100%",
              maxWidth: 700,
              borderRadius: 12,
              border: "1px solid #ddd",
            }}
          />

          <p style={{ marginTop: 12, color: "#555" }}>
            Visibility: <b>{item.visibility}</b>
          </p>
        </div>
      )}
    </main>
  );
}