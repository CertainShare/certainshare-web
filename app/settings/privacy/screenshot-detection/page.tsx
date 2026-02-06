"use client";

import Link from "next/link";

export default function ScreenshotDetectionPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings/privacy" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Screenshot detection</h1>
          <div style={styles.subtitle}>
            Understand when CertainShare may detect screenshots and what that
            means for your privacy.
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>How screenshot detection works</div>

          <p style={styles.body}>
            CertainShare may detect when screenshots are taken in specific parts
            of the app on supported devices.
          </p>

          <p style={styles.body}>
            Detection does not prevent screenshots and cannot guarantee
            notification in all cases.
          </p>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}>What we can detect</div>

          <ul style={styles.list}>
            <li style={styles.listItem}>
              Screenshots taken within certain app views
            </li>
            <li style={styles.listItem}>
              Screen capture events on supported platforms
            </li>
            <li style={styles.listItem}>
              Limited capture signals provided by the operating system
            </li>
          </ul>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}>What we cannot guarantee</div>

          <ul style={styles.list}>
            <li style={styles.listItem}>Blocking screenshots</li>
            <li style={styles.listItem}>Detection on all devices</li>
            <li style={styles.listItem}>Detection outside the app</li>
            <li style={styles.listItem}>Detection using external cameras</li>
          </ul>
        </div>

        <div style={styles.notice}>
          Screenshot detection depends on operating system support and may change
          as platforms evolve.
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}>Your responsibility</div>

          <p style={styles.body}>
            You are responsible for deciding what content to share and who you
            share it with. Screenshot detection should not be relied on as a
            security guarantee.
          </p>
        </div>

        <div style={styles.footerNote}>
          CertainShare is designed to reduce unwanted sharing, but privacy is
          always a shared responsibility.
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 780,
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
    maxWidth: 660,
  },

  card: {
    background: "white",
    borderRadius: 20,
    padding: 18,
    border: "1px solid var(--border)",
    marginBottom: 14,
    boxShadow: "var(--shadow-md)",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: 950,
    marginBottom: 10,
    color: "var(--text)",
  },

  sectionCard: {
    background: "white",
    borderRadius: 20,
    padding: 18,
    border: "1px solid var(--border)",
    marginBottom: 14,
    boxShadow: "var(--shadow-sm)",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 950,
    marginBottom: 10,
    color: "var(--text)",
  },

  body: {
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 10,
  },

  list: {
    margin: 0,
    paddingLeft: 18,
    color: "var(--muted)",
    lineHeight: 1.6,
    fontSize: 14,
  },

  listItem: {
    marginBottom: 8,
    fontWeight: 650,
  },

  notice: {
    background: "rgba(37,99,235,0.08)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    border: "1px solid rgba(37,99,235,0.18)",
    color: "var(--text)",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 800,
  },

  footerNote: {
    marginTop: 12,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
  },
};