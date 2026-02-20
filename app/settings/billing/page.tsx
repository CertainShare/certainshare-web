"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function BillingPage() {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const canBuyAddon =
  (billing?.plan === "pro" || billing?.plan === "family") &&
  billing?.cancel_at_period_end !== true;
  const billingActionRequired =
  billing?.billing_action_required === true;

  async function loadBilling() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/billing/status");
      setBilling(res);
    } catch (err: any) {
      setError(err.message || "Failed to load billing status");
    } finally {
      setLoading(false);
    }
  }

  async function refreshBilling() {
  setError("");

  try {
    const res = await apiFetch("/billing/status");
    setBilling(res);
  } catch (err: any) {
    setError(err.message || "Failed to load billing status");
  }
}

  async function openPortal() {
    setWorking(true);
    setError("");

    try {
      const res = await apiFetch("/billing/portal", {
        method: "POST",
      });

      if (!res?.url) {
        throw new Error("Portal URL missing");
      }

      window.location.href = res.url;
    } catch (err: any) {
      setError(err.message || "Failed to open billing portal");
    } finally {
      setWorking(false);
    }
  }

  async function startCheckout(plan: string, interval: "monthly" | "yearly") {
    setWorking(true);
    setError("");

    try {
      const res = await apiFetch("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan, interval }),
      });

      if (!res?.url) {
        throw new Error("Checkout URL missing");
      }

      window.location.href = res.url;
    } catch (err: any) {
      setError(err.message || "Failed to start checkout");
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadBilling();
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success !== "1") return;

    let tries = 0;
    const maxTries = 8;

      const t = setInterval(async () => {
    tries += 1;
    await refreshBilling();

    if (tries >= maxTries) {
      clearInterval(t);
    }
  }, 2000);

    return () => clearInterval(t);
  }, [searchParams]);

  const billingStatusLabel =
    billing?.cancel_at_period_end && billing?.current_period_end
      ? `Cancels ${formatDate(billing.current_period_end)}`
      : billing?.cancel_at_period_end
      ? "Cancels at period end"
      : "Active";

  const billingStatusValue = billing?.cancel_at_period_end
    ? "cancelling"
    : "active";

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Billing</h1>
            <div style={styles.subtitle}>
              Manage your subscription and storage plan.
            </div>
          </div>

          <div style={styles.headerActions}>
            <Link href="/settings" style={styles.backButton}>
              ← Back
            </Link>

            <Link href="/logout" style={styles.logoutButton}>
              Logout
            </Link>
          </div>
        </div>

        {loading && <div style={styles.centerText}>Loading...</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && billing && (
          <>
                    {billingActionRequired && (
            <div style={styles.billingWarning}>
              <strong>Payment Method Required</strong>
              <div style={{ marginTop: 6 }}>
                We were unable to process your payment.
                Please update your payment method to restore your plan.
              </div>
            </div>
          )}
            {/* CURRENT PLAN */}
            <div style={styles.currentPlanCard}>
              <div style={styles.planHeader}>
                <div>
                  <div style={styles.planLabel}>Current plan</div>
                  <div style={styles.planName}>
                    {billing.plan?.toUpperCase() || "FREE"}
                  </div>
                </div>

                <div style={styles.statusPill}>{billingStatusLabel}</div>
              </div>

              <div style={styles.planMetaRow}>
                <div style={styles.planMetaItem}>
                  <div style={styles.planMetaTitle}>Billing status</div>
                  <div style={styles.planMetaValue}>
                    {capitalize(billingStatusValue)}
                  </div>
                </div>

                <div style={styles.planMetaItem}>
                  <div style={styles.planMetaTitle}>Plan type</div>
                  <div style={styles.planMetaValue}>
                    {capitalize(billing.plan || "free")}
                  </div>
                </div>
              </div>

              <button
                onClick={openPortal}
                disabled={working}
                style={{
                  ...styles.manageButton,
                  ...(working ? styles.manageButtonDisabled : {}),
                }}
              >
                {working ? "Opening..." : "Manage Billing"}
              </button>
            </div>

            {/* PLANS */}
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>Upgrade plans</div>
              <div style={styles.sectionSub}>
                More storage, backups, and long-term protection.
              </div>
            </div>

            <div style={styles.planGrid}>
              <PlanCard
                name="Basic"
                price="$2.99/mo"
                storage="10 GB"
                note="Perfect for personal use."
                onSelect={() => startCheckout("basic", "monthly")}
                disabled={working}
                highlight={false}
              />

              <PlanCard
                name="Pro"
                price="$6.99/mo"
                storage="100 GB"
                note="Best value for serious storage."
                onSelect={() => startCheckout("pro", "monthly")}
                disabled={working}
                highlight={true}
              />

              <PlanCard
                name="Family"
                price="$17.99/mo"
                storage="400 GB"
                note="Built for families and shared albums."
                onSelect={() => startCheckout("family", "monthly")}
                disabled={working}
                highlight={false}
              />

              {canBuyAddon && (
                <div style={styles.fullWidthCard}>
                  <PlanCard
                    name="Add-on Storage"
                    price="$4.99/mo"
                    storage="+100 GB"
                    note="Extra storage for Pro and Family members."
                    onSelect={() => startCheckout("addon", "monthly")}
                    disabled={working}
                    highlight={false}
                  />
                </div>
              )}
            </div>

            <div style={styles.footerNote}>
              Payments are handled securely through Stripe.
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function PlanCard({
  name,
  price,
  storage,
  note,
  onSelect,
  disabled,
  highlight,
}: {
  name: string;
  price: string;
  storage: string;
  note: string;
  onSelect: () => void;
  disabled: boolean;
  highlight: boolean;
}) {
  return (
    <div
      style={{
        ...styles.planCard,
        ...(highlight ? styles.planCardHighlight : {}),
      }}
    >
      {highlight && <div style={styles.bestValueBadge}>Best Value</div>}

      <div style={styles.planCardTitle}>{name}</div>
      <div style={styles.planCardPrice}>{price}</div>

      <div style={styles.planCardStorage}>
        Storage: <b>{storage}</b>
      </div>

      <div style={styles.planCardNote}>{note}</div>

      <button
        onClick={onSelect}
        disabled={disabled}
        style={{
          ...styles.chooseButton,
          ...(highlight ? styles.chooseButtonHighlight : {}),
          ...(disabled ? styles.chooseButtonDisabled : {}),
        }}
      >
        Choose {name}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 950,
    margin: "0 auto",
    padding: 24,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "var(--muted)",
    fontWeight: 700,
    maxWidth: 650,
    lineHeight: "18px",
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  backButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  logoutButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "#dc2626",
    background: "white",
    border: "1px solid rgba(220,38,38,0.18)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  centerText: {
    marginTop: 30,
    textAlign: "center",
    fontWeight: 800,
    color: "var(--muted)",
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 900,
    fontSize: 13,
  },

  currentPlanCard: {
    marginTop: 10,
    borderRadius: 20,
    background: "white",
    border: "1px solid var(--border)",
    padding: 18,
    boxShadow: "var(--shadow-md)",
  },

  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 10,
  },

  planLabel: {
    fontSize: 12,
    fontWeight: 950,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  planName: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.6px",
  },

  statusPill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.18)",
    color: "#1d4ed8",
    fontWeight: 950,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  planMetaRow: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },

  planMetaItem: {
    borderRadius: 16,
    padding: 12,
    background: "rgba(15,23,42,0.02)",
    border: "1px solid rgba(15,23,42,0.08)",
  },

  planMetaTitle: {
    fontSize: 12,
    fontWeight: 950,
    color: "var(--muted)",
    marginBottom: 6,
  },

  planMetaValue: {
    fontSize: 14,
    fontWeight: 950,
    color: "var(--text)",
  },

  manageButton: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    background: "#111827",
    color: "white",
    border: "none",
    boxShadow: "0px 16px 34px rgba(17,24,39,0.18)",
  },

  manageButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 950,
    color: "var(--text)",
  },

  sectionSub: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 700,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },

  fullWidthCard: {
  gridColumn: "1 / -1",
},

  planCard: {
    borderRadius: 20,
    padding: 16,
    background: "white",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    position: "relative",
    overflow: "hidden",
  },

  planCardHighlight: {
    border: "2px solid rgba(37,99,235,0.40)",
    boxShadow: "0px 18px 40px rgba(37,99,235,0.16)",
  },

  bestValueBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.20)",
    color: "#1d4ed8",
    fontWeight: 950,
    fontSize: 11,
    padding: "6px 10px",
    borderRadius: 999,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  planCardTitle: {
    fontSize: 18,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.4px",
  },

  planCardPrice: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 900,
    color: "var(--muted)",
  },

  planCardStorage: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: 850,
    color: "var(--text)",
  },

  planCardNote: {
    marginTop: 8,
    fontSize: 13,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: "18px",
  },

  chooseButton: {
    marginTop: 14,
    width: "100%",
    padding: "11px 12px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 13,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.20)",
    color: "#1d4ed8",
  },

  chooseButtonHighlight: {
    background: "#2563eb",
    border: "1px solid rgba(37,99,235,0.45)",
    color: "white",
    boxShadow: "0px 16px 34px rgba(37,99,235,0.20)",
  },

  chooseButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  footerNote: {
    marginTop: 16,
    fontSize: 12,
    color: "var(--muted2)",
    fontWeight: 700,
    textAlign: "center",
  },

  billingWarning: {
  marginTop: 14,
  marginBottom: 18,
  padding: 14,
  borderRadius: 16,
  background: "rgba(220,38,38,0.12)",
  border: "1px solid rgba(220,38,38,0.30)",
  color: "#991b1b",
  fontWeight: 900,
  fontSize: 13,
},
};