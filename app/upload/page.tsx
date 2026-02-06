"use client";

import Link from "next/link";

export default function UploadPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/mymedia" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Upload</h1>
          <div style={styles.subtitle}>
            Add photos and videos to your CertainShare library.
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.iconCircle}>⬆️</div>

          <div style={styles.cardTitle}>Upload system coming next</div>

          <div style={styles.cardText}>
            This screen is reserved for the secure upload flow. You’ll be able to
            upload single items or entire batches into albums.
          </div>

          <div style={styles.actionRow}>
            <Link href="/mymedia" style={styles.primaryButton}>
              Go to My Media
            </Link>

            <Link href="/feed" style={styles.secondaryButton}>
              View Feed
            </Link>
          </div>
        </div>

        <div style={styles.note}>
          CertainShare uploads are designed to stay private by default.
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
    maxWidth: 620,
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

  card: {
    borderRadius: 22,
    background: "white",
    border: "1px solid var(--border)",
    padding: 22,
    boxShadow: "var(--shadow-md)",
    textAlign: "center",
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(37,99,235,0.12)",
    border: "1px solid rgba(37,99,235,0.22)",
    fontSize: 22,
  },

  cardTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: 900,
    color: "var(--text)",
  },

  cardText: {
    marginTop: 10,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.6,
    maxWidth: 480,
    marginLeft: "auto",
    marginRight: "auto",
  },

  actionRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  primaryButton: {
    textDecoration: "none",
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(37,99,235,0.40)",
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    textDecoration: "none",
    background: "white",
    color: "var(--text)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "var(--shadow-sm)",
  },

  note: {
    marginTop: 18,
    fontSize: 13,
    color: "var(--muted2)",
    textAlign: "center",
  },
};