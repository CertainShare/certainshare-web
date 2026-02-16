"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type JobStatus = "pending" | "running" | "ready" | "failed";

export default function DownloadDataPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const pollingRef = useRef<number | null>(null);

  const isBusy = status === "pending" || status === "running";
  const isReady = status === "ready" && !!downloadUrl;
  const isFailed = status === "failed";

  const statusLabel = useMemo(() => {
    if (!status) return "Not started";
    if (status === "pending") return "Queued";
    if (status === "running") return "Preparing your export";
    if (status === "ready") return "Ready to download";
    if (status === "failed") return "Failed";
    return "Unknown";
  }, [status]);

  async function startExport() {
    setError("");
    setDownloadUrl(null);

    try {
      const res = await apiFetch("/users/me/export", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const id = res.job_id as string;
      const st = res.status as JobStatus;

      setJobId(id);
      setStatus(st);
    } catch (e: any) {
      setError(e?.message || "Failed to start export");
    }
  }

  async function poll(id: string) {
    try {
      const res = await apiFetch(`/users/me/export/${id}`, { method: "GET" });

      const st = res?.job?.status as JobStatus;
      setStatus(st);

      if (st === "ready") {
        setDownloadUrl(res.download_url || null);
        stopPolling();
      }

      if (st === "failed") {
        setError(res?.job?.error_message || "Export failed");
        stopPolling();
      }
    } catch (e: any) {
      setError(e?.message || "Failed to check export status");
      stopPolling();
    }
  }

  function stopPolling() {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  useEffect(() => {
    if (!jobId) return;

    stopPolling();
    poll(jobId);

    pollingRef.current = window.setInterval(() => {
      poll(jobId);
    }, 3000);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return (
    <div style={styles.page}>
    <Link href="/settings/privacy" style={styles.backBtn}>
      ← Back
    </Link>
      <div style={styles.header}>
        <h1 style={styles.title}>Download your data</h1>
        <p style={styles.subtitle}>
          Export a copy of your photos, videos, albums, and basic account
          metadata as a ZIP file.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>What’s included</div>
          <ul style={styles.list}>
            <li>Photos and videos you uploaded</li>
            <li>Album and folder organization</li>
            <li>Captions / notes and timestamps</li>
            <li>Sharing settings (where applicable)</li>
          </ul>

          <div style={{ height: 12 }} />

          <div style={styles.cardTitle}>How it works</div>
          <ul style={styles.list}>
            <li>We prepare your export in the background</li>
            <li>When it’s ready, you can download it</li>
            <li>Download links expire after ~10 minutes</li>
            <li>Exports are deleted automatically after 7 days</li>
          </ul>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Export</div>
          <div style={styles.statusRow}>
            <div style={styles.statusDotWrap}>
              <span
                style={{
                  ...styles.statusDot,
                  ...(status === "ready"
                    ? styles.dotReady
                    : status === "failed"
                    ? styles.dotFailed
                    : status
                    ? styles.dotBusy
                    : styles.dotIdle),
                }}
              />
            </div>
            <div style={styles.statusText}>
              <div style={styles.statusLabel}>{statusLabel}</div>
              <div style={styles.statusHelp}>
                {isBusy
                  ? "This can take a few minutes for larger libraries."
                  : isReady
                  ? "Your export is ready."
                  : isFailed
                  ? "Something went wrong. You can try again."
                  : "Generate a new export whenever you want."}
              </div>
            </div>
          </div>

          {isBusy && (
            <div style={styles.progressWrap} aria-label="Preparing export">
              <div style={styles.progressBar} />
            </div>
          )}

          {!isReady && (
            <button
              onClick={startExport}
              disabled={isBusy}
              style={{
                ...styles.primaryBtn,
                ...(isBusy ? styles.primaryBtnDisabled : null),
              }}
            >
              {isBusy ? "Preparing…" : "Generate export"}
            </button>
          )}

          {isReady && (
            <>
              <a
                href={downloadUrl!}
                target="_blank"
                rel="noreferrer"
                style={styles.downloadBtn}
              >
                Download ZIP
              </a>

              <div style={styles.smallNote}>
                This link expires in about 10 minutes. If it expires, generate a
                new export.
              </div>

              <button onClick={startExport} style={styles.secondaryBtn}>
                Generate a new export
              </button>
            </>
          )}

          {error && (
            <div style={styles.errorBox}>
              <div style={styles.errorTitle}>Export error</div>
              <div style={styles.errorText}>{error}</div>
            </div>
          )}

          {/* Keep job id hidden from normal users; only show if needed for support */}
          {/* {jobId && (
            <div style={styles.supportNote}>
              Support code: <span style={styles.mono}>{jobId}</span>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 980,
    margin: "0 auto",
    padding: 16,
  },

  backBtn: {
  display: "inline-block",
  marginBottom: 14,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #e7e7e7",
  background: "white",
  fontWeight: 900,
  textDecoration: "none",
  color: "#111",
  boxShadow: "0px 8px 20px rgba(0,0,0,0.06)",
},

  header: {
    marginBottom: 14,
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    color: "#555",
    lineHeight: 1.45,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 14,
    alignItems: "start",
  },

  card: {
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    background: "#fff",
    padding: 16,
    boxShadow: "0px 10px 24px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    fontWeight: 800,
    marginBottom: 10,
    fontSize: 14,
    letterSpacing: 0.2,
    color: "#111",
  },

  list: {
    margin: 0,
    paddingLeft: 18,
    color: "#333",
    lineHeight: 1.55,
  },

  statusRow: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 12,
  },

  statusDotWrap: {
    paddingTop: 4,
  },

  statusDot: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
  },

  dotIdle: {
    background: "#d9d9d9",
  },

  dotBusy: {
    background: "#f0c24b",
  },

  dotReady: {
    background: "#36c36c",
  },

  dotFailed: {
    background: "#e05a5a",
  },

  statusText: {
    flex: 1,
  },

  statusLabel: {
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 2,
    color: "#111",
  },

  statusHelp: {
    color: "#666",
    fontSize: 13,
    lineHeight: 1.35,
  },

  progressWrap: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#f2f2f2",
    overflow: "hidden",
    border: "1px solid #e6e6e6",
    marginBottom: 12,
  },

  // simple indeterminate bar effect
  progressBar: {
    height: "100%",
    width: "45%",
    borderRadius: 999,
    background: "#d8d8d8",
    transform: "translateX(0%)",
    animation: "cs-indeterminate 1.2s ease-in-out infinite",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  primaryBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  downloadBtn: {
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "white",
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
    cursor: "pointer",
    marginBottom: 8,
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #e1e1e1",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 10,
  },

  smallNote: {
    color: "#666",
    fontSize: 13,
    lineHeight: 1.35,
  },

  errorBox: {
    marginTop: 12,
    borderRadius: 12,
    border: "1px solid rgba(224,90,90,0.35)",
    background: "rgba(224,90,90,0.08)",
    padding: 12,
  },

  errorTitle: {
    fontWeight: 900,
    color: "#9b1c1c",
    marginBottom: 4,
  },

  errorText: {
    color: "#7f1d1d",
    fontSize: 13,
    lineHeight: 1.35,
  },

  supportNote: {
    marginTop: 10,
    color: "#666",
    fontSize: 12,
  },

  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 12,
  },
};

// Add the keyframes once (safe in Next/React client component)
if (typeof document !== "undefined") {
  const id = "cs-export-indeterminate";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes cs-indeterminate {
        0% { transform: translateX(-10%); }
        50% { transform: translateX(120%); }
        100% { transform: translateX(-10%); }
      }
      @media (max-width: 860px) {
        /* stack cards on small screens */
        .cs-grid-stack { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }
}