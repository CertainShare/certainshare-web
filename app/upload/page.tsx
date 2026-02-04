"use client";

import Link from "next/link";

export default function UploadPage() {
  return (
    <main style={{ padding: 30 }}>
      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Upload</h1>

      <p style={{ marginTop: 12, color: "#555" }}>
        Upload system will be built next.
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href="/mymedia">Back to My Media</Link>
      </div>
    </main>
  );
}