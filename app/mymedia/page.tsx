"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

type Album = {
  id: string;
  name: string;
  hero_uri: string | null;
  media: any[];
};

type Upload = {
  id: string;
  url: string;
  visibility: "private" | "shared";
};

export default function MyMediaPage() {
  const [view, setView] = useState<"albums" | "uploads">("albums");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPaid, setIsPaid] = useState(false);

  async function loadBillingStatus() {
    try {
      const res = await apiFetch("/billing/status");
      setIsPaid(res?.plan !== "free");
    } catch {
      setIsPaid(false);
    }
  }

  async function loadAlbums() {
    const res = await apiFetch("/folders");
    setAlbums(res || []);
  }

  async function loadUploads() {
    const res = await apiFetch("/media/my");
    setUploads(res || []);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");

    try {
      await loadBillingStatus();
      await loadAlbums();
      await loadUploads();
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAlbum(folderId: string) {
    const ok = confirm(
      isPaid
        ? "Delete folder? This will move media into Trash."
        : "Delete folder? This will permanently delete all media inside it."
    );

    if (!ok) return;

    try {
      await apiFetch(`/folders/${folderId}`, { method: "DELETE" });
      await refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteUpload(mediaId: string) {
    const ok = confirm(
      isPaid
        ? "Delete media? This will move it to Trash."
        : "Delete media? This will permanently delete it."
    );

    if (!ok) return;

    try {
      await apiFetch(`/media/${mediaId}`, { method: "DELETE" });
      await refreshAll();
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

    refreshAll();
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>My Media</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: "bold" }}>
          Your Private Library
        </h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Organize photos into albums, or keep individual media in uploads.
        </p>

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button
            onClick={() => setView("albums")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: view === "albums" ? "#e8f0ff" : "white",
              cursor: "pointer",
            }}
          >
            Albums
          </button>

          <button
            onClick={() => setView("uploads")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: view === "uploads" ? "#e8f0ff" : "white",
              cursor: "pointer",
            }}
          >
            Uploads
          </button>

          {isPaid && (
            <Link style={{ marginLeft: "auto" }} href="/trash">
              Trash
            </Link>
          )}
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && view === "albums" && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold" }}>Albums</h3>

          {albums.length === 0 ? (
            <p style={{ marginTop: 20, color: "#666" }}>No albums yet</p>
          ) : (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {albums.map((album) => (
                <div
                  key={album.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <Link
                    href={`/album/${album.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        background: "#eee",
                      }}
                    >
                      {album.hero_uri && (
                        <img
                          src={album.hero_uri}
                          alt={album.name}
                          style={{ width: "100%", height: "100%" }}
                        />
                      )}
                    </div>

                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: "bold" }}>{album.name}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {album.media?.length || 0} items
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: 12, paddingTop: 0 }}>
                    <button
                      onClick={() => deleteAlbum(album.id)}
                      style={{
                        padding: 8,
                        width: "100%",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && view === "uploads" && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold" }}>Uploads</h3>

          {uploads.length === 0 ? (
            <p style={{ marginTop: 20, color: "#666" }}>No uploads yet</p>
          ) : (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 10,
              }}
            >
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    background: "#eee",
                    position: "relative",
                  }}
                >
                  <Link href={`/media/${upload.id}`}>
  <img
    src={upload.url}
    alt="upload"
    style={{ width: "100%", height: 120, objectFit: "cover" }}
  />
</Link>

                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(255,255,255,0.9)",
                      padding: "4px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                    }}
                  >
                    {upload.visibility}
                  </div>

                  <button
                    onClick={() => deleteUpload(upload.id)}
                    style={{
                      width: "100%",
                      padding: 8,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Link
        href="/upload"
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          background: "#2563eb",
          color: "white",
          padding: "14px 18px",
          borderRadius: 999,
          fontWeight: "bold",
          textDecoration: "none",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.25)",
        }}
      >
        + Upload
      </Link>
    </main>
  );
}