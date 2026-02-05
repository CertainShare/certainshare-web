"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function NewAlbumPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/folders", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      router.push("/mymedia");
    } catch (err: any) {
      setError(err.message || "Failed to create album");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 30, maxWidth: 500 }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>New Album</h1>

      <form onSubmit={createAlbum} style={{ marginTop: 20 }}>
        <label>Album Name</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="Example: Vacation 2026"
        />

        {error && (
          <p style={{ marginTop: 12, color: "red" }}>Error: {error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            marginTop: 16,
            padding: 12,
            width: "100%",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Album"}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <Link href="/mymedia">Back</Link>
      </div>
    </main>
  );
}