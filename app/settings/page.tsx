"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import TopNav from "../components/TopNav";

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
    <main style={styles.page}>
      <TopNav />

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Settings</h1>
            <div style={styles.subtitle}>Manage your account and privacy.</div>
          </div>

          <div style={styles.headerLinks}>
            <Link href="/mymedia" style={styles.headerLink}>
              My Media
            </Link>

            <Link href="/logout" style={styles.headerLinkDanger}>
              Logout
            </Link>
          </div>
        </div>

        {loading && <p style={styles.statusText}>Loading...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Identity */}
            <div style={styles.identityCard}>
              <img
                src={
                  me?.profile_photo_url ||
                  "https://www.gravatar.com/avatar/?d=mp&s=200"
                }
                alt="Profile"
                style={styles.profileImage}
              />

              <div style={styles.identityText}>
                <div style={styles.identityName}>
                  {me?.display_name || "Your Account"}
                </div>

                <div style={styles.identityTagline}>
                  Private family memories, shared intentionally.
                </div>

                <div style={styles.planText}>
                  Plan: <b>{billing?.plan || "free"}</b>
                </div>
              </div>
            </div>

            {/* Storage */}
            <div style={{ marginTop: 18 }}>
              <div style={styles.sectionLabel}>Storage</div>

              <div style={styles.card}>
                <div style={styles.storageHeader}>
                  <span style={styles.storageNumbers}>
                    <b>{usedGB.toFixed(2)} GB</b> of{" "}
                    <b>{totalGB.toFixed(2)} GB</b> used
                  </span>

                  <span style={{ ...styles.storagePercent, color: barColor }}>
                    {Math.round(usagePercent)}%
                  </span>
                </div>

                <div style={styles.storageBarOuter}>
                  <div
                    style={{
                      ...styles.storageBarInner,
                      width: `${usagePercent}%`,
                      background: barColor,
                    }}
                  />
                </div>

                <Link href="/settings/billing" style={styles.primaryButton}>
                  Upgrade Storage
                </Link>
              </div>
            </div>

            {/* Account */}
            <div style={{ marginTop: 18 }}>
              <div style={styles.sectionLabel}>Account</div>

              <div style={styles.cardList}>
                <Row label="Edit profile" href="/settings/edit-profile" />
                <Row label="Privacy & security" href="/settings/privacy" />
                <Row label="Billing" href="/settings/billing" />
                <Row label="Legal & terms" href="/settings/legal" />
              </div>
            </div>

            {/* Sign out */}
            <div style={{ marginTop: 18 }}>
              <Link href="/logout" style={styles.signOutButton}>
                Sign out
              </Link>
            </div>
          </>
        )}
      </div>
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
        alignItems: "center",
        padding: "14px 16px",
        textDecoration: "none",
        color: "var(--text)",
        borderBottom: "1px solid rgba(15,23,42,0.06)",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--muted2)", fontSize: 18 }}>›</span>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 750,
    margin: "0 auto",
    padding: 24,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 6,
    paddingBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 850,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--muted)",
  },

  headerLinks: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  headerLink: {
    textDecoration: "none",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    color: "var(--text)",
    boxShadow: "var(--shadow-sm)",
  },

  headerLinkDanger: {
    textDecoration: "none",
    background: "rgba(220,38,38,0.06)",
    border: "1px solid rgba(220,38,38,0.18)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 850,
    fontSize: 13,
    color: "#dc2626",
    boxShadow: "var(--shadow-sm)",
  },

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
  },

  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontWeight: 700,
  },

  identityCard: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "white",
    boxShadow: "var(--shadow-md)",
  },

  profileImage: {
    width: 74,
    height: 74,
    borderRadius: 999,
    objectFit: "cover",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
    flexShrink: 0,
  },

  identityText: {
    flex: 1,
  },

  identityName: {
    fontSize: 18,
    fontWeight: 900,
    color: "var(--text)",
  },

  identityTagline: {
    marginTop: 6,
    fontSize: 13,
    color: "var(--muted)",
  },

  planText: {
    marginTop: 10,
    fontSize: 13,
    color: "var(--muted2)",
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--muted2)",
    marginBottom: 10,
  },

  card: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    padding: 16,
    boxShadow: "var(--shadow-md)",
  },

  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },

  storageNumbers: {
    fontSize: 14,
    color: "var(--text)",
  },

  storagePercent: {
    fontSize: 13,
    fontWeight: 900,
  },

  storageBarOuter: {
    height: 10,
    borderRadius: 999,
    background: "rgba(15,23,42,0.08)",
    overflow: "hidden",
  },

  storageBarInner: {
    height: "100%",
    transition: "width 0.2s ease",
  },

  primaryButton: {
    display: "inline-block",
    marginTop: 14,
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(37,99,235,0.40)",
    boxShadow: "0px 14px 28px rgba(37,99,235,0.20)",
  },

  cardList: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },

  signOutButton: {
    display: "block",
    textAlign: "center",
    padding: 14,
    borderRadius: 16,
    background: "rgba(220,38,38,0.06)",
    color: "#dc2626",
    fontWeight: 900,
    textDecoration: "none",
    border: "1px solid rgba(220,38,38,0.18)",
    boxShadow: "var(--shadow-sm)",
  },
};