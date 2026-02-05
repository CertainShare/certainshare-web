"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 30, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>Change password</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/profile">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label style={labelStyle}>Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          style={inputStyle}
        />

        <label style={labelStyle}>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          style={inputStyle}
        />

        <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          Passwords must be at least 8 characters.
        </p>

        {error && (
          <p style={{ marginTop: 10, fontSize: 13, color: "red" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          style={{
            marginTop: 18,
            width: "100%",
            padding: 12,
            borderRadius: 12,
            cursor: isValid ? "pointer" : "not-allowed",
            fontWeight: "bold",
            background: isValid ? "#2563eb" : "#ddd",
            color: isValid ? "white" : "#666",
            border: "none",
          }}
        >
          {submitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 14,
  marginBottom: 6,
  fontSize: 13,
  fontWeight: "bold",
  color: "#666",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 15,
};