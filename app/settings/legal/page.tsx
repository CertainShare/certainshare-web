"use client";

import Link from "next/link";

export default function LegalIndexPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Legal & Terms</h1>
          <div style={styles.subtitle}>
            Review policies, terms, and important information about how
            CertainShare works.
          </div>
        </div>

        <div style={styles.card}>
          <Row label="Terms of Service" href="/settings/legal/terms" />
          <Row label="Privacy Policy" href="/settings/legal/privacy" />
          <Row label="Acceptable Use Policy" href="/settings/legal/aup" />
          <Row label="Abuse & Safety Reporting" href="/settings/legal/abuse" />
          <Row label="Backups & Data Retention" href="/settings/legal/backups" />
          <Row label="Contact & Legal" href="/settings/legal/contact" />
        </div>

        <div style={styles.footerNote}>
          These documents help define how CertainShare protects your privacy.
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
    maxWidth: 620,
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

  footerNote: {
    marginTop: 16,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
  },
};