"use client";

import Link from "next/link";

export default function ReportAbusePage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings/privacy" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Report Abuse</h1>
          <div style={styles.subtitle}>
            CertainShare takes abuse, safety, and legal concerns seriously. Use
            the appropriate contact below so your message is handled as quickly
            as possible.
          </div>
        </div>

        <div style={styles.grid}>
          <EmailCard
            label="Abuse & reporting"
            email="report@certainshare.com"
            description="Harassment, exploitation, illegal content, or safety concerns."
          />

          <EmailCard
            label="Support"
            email="support@certainshare.com"
            description="Account help, technical issues, or general questions."
          />

          <EmailCard
            label="Privacy"
            email="privacy@certainshare.com"
            description="Privacy questions, data requests, or concerns about personal information."
          />

          <EmailCard
            label="Legal"
            email="legal@certainshare.com"
            description="Legal inquiries, law enforcement requests, or formal notices."
          />
        </div>

        <div style={styles.notice}>
          For urgent safety issues or illegal content involving minors, contact
          Abuse & Reporting immediately.
        </div>

        <div style={styles.footerNote}>
          We review reports as quickly as possible. Response time may vary based
          on severity and volume.
        </div>
      </div>
    </main>
  );
}

function EmailCard({
  label,
  email,
  description,
}: {
  label: string;
  email: string;
  description: string;
}) {
  return (
    <a href={`mailto:${email}`} style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardEmail}>{email}</div>
      <div style={styles.cardDescription}>{description}</div>
    </a>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 900,
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
    marginTop: 10,
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--muted)",
    maxWidth: 740,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    marginTop: 16,
  },

  card: {
    display: "block",
    textDecoration: "none",
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    padding: 16,
    boxShadow: "var(--shadow-md)",
    color: "inherit",
  },

  cardLabel: {
    fontWeight: 950,
    fontSize: 14,
    color: "var(--text)",
    marginBottom: 6,
  },

  cardEmail: {
    fontWeight: 950,
    fontSize: 14,
    color: "#2563eb",
    marginBottom: 10,
  },

  cardDescription: {
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.5,
    fontWeight: 650,
  },

  notice: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    fontWeight: 900,
    color: "#991b1b",
    fontSize: 13,
    lineHeight: 1.5,
  },

  footerNote: {
    marginTop: 14,
    fontSize: 13,
    color: "var(--muted2)",
    lineHeight: 1.5,
  },
};