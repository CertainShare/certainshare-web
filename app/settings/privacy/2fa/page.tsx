"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function TwoFactorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enabled, setEnabled] = useState(false);

  // Setup flow
  const [setupLoading, setSetupLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Disable flow
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/users/me");

      setEnabled(!!res?.two_factor_enabled);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function startSetup() {
    setError("");
    setSetupLoading(true);

    try {
      const res = await apiFetch("/2fa/setup", {
        method: "POST",
      });

      setQrCodeDataUrl(res.qrCodeDataUrl || null);
      setSetupSecret(res.secret || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSetupLoading(false);
    }
  }

  async function confirmSetup() {
    setError("");
    setConfirmLoading(true);

    try {
      await apiFetch("/2fa/confirm", {
        method: "POST",
        body: JSON.stringify({ code: setupCode }),
      });

      setQrCodeDataUrl(null);
      setSetupSecret(null);
      setSetupCode("");

      await loadStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirmLoading(false);
    }
  }

  async function disable2FA() {
    setError("");
    setDisableLoading(true);

    try {
      await apiFetch("/2fa/disable", {
        method: "POST",
        body: JSON.stringify({
          password: disablePassword,
          code: disableCode,
        }),
      });

      setDisablePassword("");
      setDisableCode("");

      await loadStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDisableLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/settings/privacy" style={styles.backButton}>
          ← Back
        </Link>

        <div style={styles.header}>
          <h1 style={styles.title}>Two-Factor Authentication</h1>
          <div style={styles.subtitle}>
            Add extra protection to your account using an authenticator app.
          </div>
        </div>

        {loading ? (
          <div style={styles.card}>Loading...</div>
        ) : (
          <>
            <div style={styles.card}>
              <div style={styles.row}>
                <div>
                  <div style={styles.rowTitle}>Status</div>
                  <div style={styles.rowSub}>
                    {enabled ? "Enabled" : "Disabled"}
                  </div>
                </div>

                <div
                  style={{
                    ...styles.statusPill,
                    ...(enabled ? styles.statusOn : styles.statusOff),
                  }}
                >
                  {enabled ? "ON" : "OFF"}
                </div>
              </div>
            </div>

            {!enabled && (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>Enable 2FA</div>
                <div style={styles.sectionText}>
                  Step 1: Generate a QR code and scan it with Google
                  Authenticator, Authy, or Microsoft Authenticator.
                </div>

                <button
                  onClick={startSetup}
                  disabled={setupLoading}
                  style={{
                    ...styles.primaryButton,
                    ...(setupLoading ? styles.primaryButtonDisabled : {}),
                  }}
                >
                  {setupLoading ? "Generating..." : "Generate QR Code"}
                </button>

                {qrCodeDataUrl && (
                  <div style={{ marginTop: 18 }}>
                    <div style={styles.sectionText}>
                      Step 2: Scan this QR code in your authenticator app.
                    </div>

                    <div style={styles.qrWrap}>
                      <img
                        src={qrCodeDataUrl}
                        alt="2FA QR Code"
                        style={styles.qrImage}
                      />
                    </div>

                    {setupSecret && (
                      <div style={styles.secretBox}>
                        <div style={styles.secretLabel}>
                          Manual setup key (if needed)
                        </div>
                        <div style={styles.secretValue}>{setupSecret}</div>
                      </div>
                    )}

                    <div style={{ marginTop: 18 }}>
                      <div style={styles.sectionText}>
                        Step 3: Enter the 6-digit code to confirm.
                      </div>

                      <input
                        value={setupCode}
                        onChange={(e) =>
                          setSetupCode(
                            e.target.value
                              .replace(/[^0-9]/g, "")
                              .slice(0, 6)
                          )
                        }
                        style={styles.codeInput}
                        placeholder="123456"
                        inputMode="numeric"
                      />

                      <button
                        onClick={confirmSetup}
                        disabled={confirmLoading || setupCode.length !== 6}
                        style={{
                          ...styles.primaryButton,
                          ...(confirmLoading || setupCode.length !== 6
                            ? styles.primaryButtonDisabled
                            : {}),
                        }}
                      >
                        {confirmLoading ? "Confirming..." : "Confirm 2FA"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {enabled && (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>Disable 2FA</div>
                <div style={styles.sectionText}>
                  Enter your password and a valid authenticator code to disable
                  two-factor authentication.
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    style={styles.input}
                    placeholder="Enter password"
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={styles.label}>Authenticator Code</label>
                  <input
                    value={disableCode}
                    onChange={(e) =>
                      setDisableCode(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                      )
                    }
                    style={styles.input}
                    placeholder="123456"
                    inputMode="numeric"
                  />
                </div>

                <button
                  onClick={disable2FA}
                  disabled={
                    disableLoading ||
                    disablePassword.length < 1 ||
                    disableCode.length !== 6
                  }
                  style={{
                    ...styles.dangerButton,
                    ...(disableLoading ||
                    disablePassword.length < 1 ||
                    disableCode.length !== 6
                      ? styles.primaryButtonDisabled
                      : {}),
                  }}
                >
                  {disableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            )}

            {error && <div style={styles.errorBox}>Error: {error}</div>}
          </>
        )}
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

  card: {
    borderRadius: 18,
    background: "white",
    border: "1px solid var(--border)",
    padding: 18,
    boxShadow: "var(--shadow-md)",
    marginBottom: 16,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowTitle: {
    fontWeight: 950,
    fontSize: 14,
    color: "var(--text)",
  },

  rowSub: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 800,
    color: "var(--muted)",
  },

  statusPill: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 950,
  },

  statusOn: {
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#166534",
  },

  statusOff: {
    background: "rgba(107,114,128,0.12)",
    border: "1px solid rgba(107,114,128,0.25)",
    color: "#374151",
  },

  sectionTitle: {
    fontWeight: 950,
    fontSize: 14,
    color: "var(--text)",
  },

  sectionText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 800,
    color: "var(--muted)",
    lineHeight: 1.5,
  },

  qrWrap: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    display: "flex",
    justifyContent: "center",
  },

  qrImage: {
    width: 180,
    height: 180,
  },

  secretBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
  },

  secretLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "var(--muted2)",
  },

  secretValue: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 950,
    color: "var(--text)",
    wordBreak: "break-all",
  },

  codeInput: {
    marginTop: 10,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.02)",
    fontSize: 18,
    fontWeight: 950,
    letterSpacing: "4px",
    textAlign: "center",
    outline: "none",
  },

  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 900,
    color: "var(--muted2)",
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

  dangerButton: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(220,38,38,0.35)",
    cursor: "pointer",
    background: "#dc2626",
    color: "white",
    fontWeight: 950,
    fontSize: 14,
    boxShadow: "0px 14px 28px rgba(220,38,38,0.18)",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  errorBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },
};