"use client";

import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f6f7fb",
      padding: 24,
    }}>
      <div style={{
        background: "white",
        padding: 28,
        borderRadius: 20,
        border: "1px solid rgba(15,23,42,0.1)",
        maxWidth: 420,
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>
          Check your email
        </h1>

        <p style={{ marginTop: 12, fontSize: 14, color: "#6b7280" }}>
          We sent you a verification link. Click it to activate your account.
        </p>

        <Link href="/login" style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 16px",
          borderRadius: 12,
          background: "#2563eb",
          color: "white",
          fontWeight: 800,
          textDecoration: "none"
        }}>
          Go to login
        </Link>
      </div>
    </main>
  );
}