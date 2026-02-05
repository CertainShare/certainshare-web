"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        const m = await apiFetch("/users/me");
        const s = await apiFetch("/storage/fullness");
        const b = await apiFetch("/billing/status");

        setMe(m);
        setStorage(s);
        setBilling(b);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const usedGB = storage ? storage.used_bytes / 1024 / 1024 / 1024 : 0;
  const totalGB = storage ? storage.max_bytes / 1024 / 1024 / 1024 : 1;

  const usagePercent = storage
    ? Math.min(storage.percent_full * 100, 100)
    : 0;

  const barColor =
    usagePercent >= 90 ? "#dc2626" : usagePercent >= 70 ? "#f97316" : "#2563eb";

  return (
    <main style={{ padding: 30, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Settings</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/mymedia">My Media</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Identity */}
          <div
            style={{
              marginTop: 20,
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
              background: "white",
            }}
          >
            <img
  src={me?.profile_photo_url || "https://www.gravatar.com/avatar/?d=mp&s=200"}
  alt="Profile"
  style={{
    width: 90,
    height: 90,
    borderRadius: 999,
    objectFit: "cover",
    border: "1px solid #ddd",
  }}
/>

            <div style={{ fontSize: 20, fontWeight: "bold", marginTop: 6 }}>
              {me?.display_name || "Your Account"}
            </div>

            <div style={{ marginTop: 6, fontSize: 14, color: "#666" }}>
              Private family memories, shared intentionally.
            </div>

            <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
              Plan: <b>{billing?.plan || "free"}</b>
            </div>
          </div>

          {/* Storage */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "#666",
                marginBottom: 8,
              }}
            >
              STORAGE
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 14,
                padding: 16,
                background: "white",
              }}
            >
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "#eee",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${usagePercent}%`,
                    background: barColor,
                  }}
                />
              </div>

              <div style={{ marginTop: 10, fontSize: 14, color: barColor }}>
                <b>{usedGB.toFixed(2)} GB</b> of <b>{totalGB.toFixed(2)} GB</b>{" "}
                used
              </div>

              <Link
                href="/plans"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  background: "#2563eb",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                Manage storage
              </Link>
            </div>
          </div>

          {/* Account */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "#666",
                marginBottom: 8,
              }}
            >
              ACCOUNT
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 14,
                background: "white",
                overflow: "hidden",
              }}
            >
              <Row label="Edit profile" href="/settings/edit-profile" />
              <Row label="Change password" href="/settings/change-password" />
              <Row label="Privacy & security" href="/settings/privacy" />
              <Row label="Billing" href="/settings/billing" />
              <Row label="Legal & terms" href="/settings/legal" />
            </div>
          </div>

          {/* Sign out */}
          <div style={{ marginTop: 24 }}>
            <Link
              href="/logout"
              style={{
                display: "block",
                textAlign: "center",
                padding: 12,
                borderRadius: 14,
                background: "#dc262612",
                color: "#dc2626",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Sign out
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function Row({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 16px",
        textDecoration: "none",
        color: "black",
        borderBottom: "1px solid #eee",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "#999" }}>›</span>
    </Link>
  );
}