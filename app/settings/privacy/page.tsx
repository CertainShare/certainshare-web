"use client";

import Link from "next/link";

export default function PrivacyIndexPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Privacy & Security</h1>
          <div style={styles.subtitle}>
            Manage your privacy settings and account security.
          </div>
        </div>

        <div style={styles.sectionLabel}>Account Security</div>
        <div style={styles.card}>
          <Row label="Change password" href="/settings/change-password" />
          <Row
            label="Two-factor authentication"
            href="/settings/privacy/2fa"
          />
          <Row
            label="Log out of all devices"
            href="/settings/privacy/logout-all"
          />
        </div>

        <div style={styles.sectionLabel}>Privacy Controls</div>
        <div style={styles.card}>
          <Row
            label="Sharing preferences"
            href="/settings/privacy/sharing"
          />
          <Row
            label="Screenshot detection"
            href="/settings/privacy/screenshot-detection"
          />
        </div>

        <div style={styles.sectionLabel}>Data & Access</div>
        <div style={styles.card}>
          <Row label="Download my data" href="/settings/privacy/download-data" />
          <Row label="Delete my account" href="/settings/privacy/delete-account" />
        </div>

        <div style={styles.sectionLabel}>Safety</div>
        <div style={styles.card}>
          <Row label="Blocked users" href="/settings/privacy/blocked" />
          <Row label="Report abuse" href="/settings/privacy/report" />
        </div>
      </div>
    </main>
  );
}

function Row({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.chevron}>›</span>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 760,
    margin: "0 auto",
    padding: 24,
  },

  backButton: {
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 850,
    fontSize: 13,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  header: {
    marginTop: 16,
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.5,
  },

  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--muted2)",
  },

  card: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    textDecoration: "none",
    color: "var(--text)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  rowLabel: {
    fontWeight: 800,
    fontSize: 14,
  },

  chevron: {
    color: "var(--muted2)",
    fontSize: 18,
    fontWeight: 900,
  },
};