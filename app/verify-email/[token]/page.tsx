"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();

  const token =
    typeof params?.token === "string" ? params.token : undefined;

  const [status, setStatus] = useState<
    "loading" | "success" | "expired" | "invalid"
  >("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email/${token}`
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
        } else if (data?.code === "TOKEN_EXPIRED") {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    }

    verify();
  }, [token]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>CS</div>
            <div>
              <div style={styles.brandName}>CertainShare</div>
              <div style={styles.brandTagline}>
                Private family memories, shared intentionally.
              </div>
            </div>
          </div>

          {status === "loading" && (
            <>
              <h1 style={styles.title}>Verifying your email…</h1>
              <div style={styles.subtitle}>
                Please wait while we confirm your account.
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <h1 style={styles.title}>Email verified 🎉</h1>
              <div style={styles.subtitle}>
                Your account is now active. You can log in and start using
                CertainShare.
              </div>
              <button
                onClick={() => router.push("/login")}
                style={styles.primaryButton}
              >
                Go to login
              </button>
            </>
          )}

          {status === "expired" && (
            <>
              <h1 style={styles.title}>Verification link expired</h1>
              <div style={styles.subtitle}>
                This link has expired. Please request a new verification email.
              </div>
              <button
                onClick={() => router.push("/login")}
                style={styles.secondaryButton}
              >
                Back to login
              </button>
            </>
          )}

          {status === "invalid" && (
            <>
              <h1 style={styles.title}>Invalid verification link</h1>
              <div style={styles.subtitle}>
                This link is not valid. Please request a new verification email.
              </div>
              <button
                onClick={() => router.push("/login")}
                style={styles.secondaryButton}
              >
                Back to login
              </button>
            </>
          )}
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

  container: {
    width: "100%",
    maxWidth: 440,
  },

  card: {
    background: "white",
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 28,
    boxShadow: "0px 18px 50px rgba(0,0,0,0.08)",
  },

  brandRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #4f46e5, #9333ea)",
    color: "white",
    fontWeight: 900,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.5px",
  },

  brandName: {
    fontWeight: 950,
    fontSize: 15,
    color: "#111827",
    letterSpacing: "-0.3px",
  },

  brandTagline: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: "16px",
  },

  title: {
    fontSize: 24,
    fontWeight: 950,
    margin: 0,
    marginBottom: 8,
    color: "#111827",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: "20px",
    marginBottom: 20,
  },

  primaryButton: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(37,99,235,0.40)",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
    fontWeight: 950,
    fontSize: 14,
    boxShadow: "0px 14px 28px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    cursor: "pointer",
    background: "white",
    color: "#111827",
    fontWeight: 950,
    fontSize: 14,
  },
};