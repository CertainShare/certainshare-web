"use client";

import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

// If backend says 2FA required, redirect to challenge screen
if (res.requires2fa && res.tempToken) {
  sessionStorage.setItem("tempToken", res.tempToken);
router.push("/login/2fa");
  return;
}

      // Otherwise normal login token
      const token = res.token;

      if (!token) {
        throw new Error("No token returned from server");
      }

      localStorage.setItem("token", token);
      router.push("/feed");
      } catch (err: any) {
        if (err?.code === "EMAIL_NOT_VERIFIED") {
          // store email so resend page can use it
          localStorage.setItem("pending_verify_email", email);

          router.push("/verify-email");
          return;
        }

        setError(err.message || "Login failed");
      } finally {
      setLoading(false);
    }
  }

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

          <h1 style={styles.title}>Sign in</h1>
          <div style={styles.subtitle}>
            Log in to access your media, albums, and private shares.
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>

              <div style={{ position: "relative" }}>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && <div style={styles.errorBox}>Error: {error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                ...(loading ? styles.primaryButtonDisabled : {}),
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <div style={styles.dividerText}>OR</div>
            <div style={styles.dividerLine} />
          </div>

          <Link href="/signup" style={styles.secondaryButton}>
            Create an account
          </Link>

          <div style={styles.footerText}>
            By continuing, you agree to CertainShare’s privacy-first platform
            policies.
          </div>
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
    padding: 22,
    boxShadow: "0px 18px 50px rgba(0,0,0,0.08)",
  },

  brandRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 26,
    fontWeight: 950,
    margin: 0,
    marginTop: 6,
    color: "#111827",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: "18px",
  },

  form: {
    marginTop: 18,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    display: "block",
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 900,
    color: "#111827",
  },

  input: {
    width: "100%",
    padding: "12px 40px 12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  errorBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 6,
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

  primaryButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  dividerRow: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(15,23,42,0.10)",
  },

  dividerText: {
    fontSize: 11,
    fontWeight: 900,
    color: "#6b7280",
    letterSpacing: "0.6px",
  },

  secondaryButton: {
    marginTop: 18,
    display: "block",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 14,
    color: "#111827",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
  },

  footerText: {
    marginTop: 18,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: "16px",
    textAlign: "center",
  },
};