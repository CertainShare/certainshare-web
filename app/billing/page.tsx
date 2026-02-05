"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function BillingPage() {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

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

  async function startCheckout(plan: string) {
    setWorking(true);
    setError("");

    try {
      const res = await apiFetch("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
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

  return (
    <main style={{ padding: 30, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Billing</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/profile">Back</Link>
          <Link href="/logout">Logout</Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: "red" }}>{error}</p>}

      {!loading && !error && billing && (
        <>
          <div
            style={{
              marginTop: 20,
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 16,
              background: "white",
            }}
          >
            <div style={{ fontSize: 14, color: "#666" }}>Current Plan</div>

            <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>
              {billing.plan?.toUpperCase() || "FREE"}
            </div>

            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              Status: <b>{billing.status || "active"}</b>
            </div>

            <button
              onClick={openPortal}
              disabled={working}
              style={{
                marginTop: 14,
                width: "100%",
                padding: 12,
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: "bold",
                background: "#111",
                color: "white",
                border: "none",
              }}
            >
              {working ? "Opening..." : "Manage Billing"}
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "#666",
                marginBottom: 8,
              }}
            >
              UPGRADE PLANS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              <PlanCard
                name="Basic"
                price="$2.99/mo"
                storage="10 GB"
                onSelect={() => startCheckout("basic_monthly")}
                disabled={working}
              />

              <PlanCard
                name="Pro"
                price="$6.99/mo"
                storage="100 GB"
                onSelect={() => startCheckout("pro_monthly")}
                disabled={working}
              />

              <PlanCard
                name="Family"
                price="$17.99/mo"
                storage="400 GB"
                onSelect={() => startCheckout("family_monthly")}
                disabled={working}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function PlanCard({
  name,
  price,
  storage,
  onSelect,
  disabled,
}: {
  name: string;
  price: string;
  storage: string;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 14,
        padding: 14,
        background: "white",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: "bold" }}>{name}</div>

      <div style={{ marginTop: 6, fontSize: 14, color: "#666" }}>{price}</div>

      <div style={{ marginTop: 10, fontSize: 13 }}>
        Storage: <b>{storage}</b>
      </div>

      <button
        onClick={onSelect}
        disabled={disabled}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 10,
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: "bold",
          background: "#2563eb",
          color: "white",
          border: "none",
        }}
      >
        Choose {name}
      </button>
    </div>
  );
}