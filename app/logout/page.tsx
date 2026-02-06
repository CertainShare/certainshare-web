"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoCircle}>CS</div>

        <h1 style={styles.title}>Signing you out</h1>

        <div style={styles.subtitle}>
          Clearing your session and redirecting you to login.
        </div>

        <div style={styles.spinnerRow}>
          <div style={styles.spinner} />
          <div style={styles.spinnerText}>Logging out...</div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f6f7fb",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    background: "white",
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 26,
    textAlign: "center",
    boxShadow: "0px 18px 50px rgba(0,0,0,0.08)",
  },

  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    margin: "0 auto",
    background: "linear-gradient(135deg, #2563eb, #4f46e5, #9333ea)",
    color: "white",
    fontWeight: 950,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.5px",
  },

  title: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: 950,
    color: "#111827",
    letterSpacing: "-0.5px",
    marginBottom: 0,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: "18px",
  },

  spinnerRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  spinner: {
    width: 16,
    height: 16,
    borderRadius: 999,
    border: "2px solid rgba(37,99,235,0.20)",
    borderTop: "2px solid #2563eb",
    animation: "spin 0.9s linear infinite",
  },

  spinnerText: {
    fontSize: 13,
    fontWeight: 850,
    color: "#111827",
  },
};