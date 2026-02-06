"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function isOver13(dateStr: string) {
    if (!dateStr) return false;

    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return false;

    const today = new Date();
    const thirteenYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );

    return birth <= thirteenYearsAgo;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password || !birthdate) {
      setError("Please fill out all fields.");
      return;
    }

    if (!isOver13(birthdate)) {
      setError("You must be at least 13 years old to use CertainShare.");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms and Privacy Policy to sign up.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          birthdate,
          accepted_terms: true,
        }),
      });

      const token = res.token;

      if (!token) {
        throw new Error("Signup succeeded but no token was returned.");
      }

      localStorage.setItem("token", token);

      router.push("/mymedia");
    } catch (err: any) {
      setError(err.message || "Signup failed");
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

          <h1 style={styles.title}>Create account</h1>
          <div style={styles.subtitle}>
            Create a private media vault for your family photos, videos, and
            albums.
          </div>

          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                type="email"
                placeholder="you@email.com"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                type="password"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date of birth</label>
              <input
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                style={styles.input}
                type="date"
              />
              <div style={styles.hint}>
                You must be 13 or older to use CertainShare.
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={styles.checkbox}
              />

              <div style={styles.checkboxText}>
                I agree to the{" "}
                <Link href="/settings/legal" style={styles.link}>
                  Terms of Service and Privacy Policy
                </Link>
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div style={styles.footerRow}>
            <div style={styles.footerText}>Already have an account?</div>
            <Link href="/login" style={styles.footerLink}>
              Sign in
            </Link>
          </div>

          <div style={styles.smallPrint}>
            CertainShare does not sell your data. Ever.
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
    maxWidth: 460,
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
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 14,
    outline: "none",
  },

  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: "16px",
  },

  checkboxRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.02)",
  },

  checkbox: {
    marginTop: 2,
    cursor: "pointer",
    width: 16,
    height: 16,
  },

  checkboxText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.4,
    fontWeight: 700,
  },

  link: {
    color: "#2563eb",
    fontWeight: 950,
    textDecoration: "none",
  },

  errorBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  primaryButton: {
    marginTop: 14,
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

  footerRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
  },

  footerText: {
    color: "#6b7280",
    fontWeight: 700,
  },

  footerLink: {
    fontWeight: 950,
    textDecoration: "none",
    color: "#2563eb",
  },

  smallPrint: {
    marginTop: 16,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: "16px",
    textAlign: "center",
  },
};