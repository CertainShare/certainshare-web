"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import UploadFlowModal from "@/app/components/UploadFlowModal";
import { apiFetch } from "@/lib/api";

type UploadFabProps = {
  defaultFolderId?: string | null;
};

export default function UploadFab({ defaultFolderId = null }: UploadFabProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [flow, setFlow] = useState<"folder" | "media" | null>(null);

  const [overLimit, setOverLimit] = useState(false);
  const [overLimitDeadline, setOverLimitDeadline] = useState<string | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const searchParams = useSearchParams();
  const [showUploadHint, setShowUploadHint] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpenMenu(false);
      }
    }

    if (openMenu) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openMenu]);

  useEffect(() => {
    const isNewUser = searchParams.get("new") === "1";

    if (isNewUser) {
      setShowUploadHint(true);

      const t = setTimeout(() => {
        setShowUploadHint(false);
      }, 6000);

      return () => clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
  async function loadStorage() {
    try {
      const res = await apiFetch("/storage/fullness");

      if (res?.over_limit_mode) {
        setOverLimit(true);
        setOverLimitDeadline(res.over_limit_deadline || null);
      } else {
        setOverLimit(false);
        setOverLimitDeadline(null);
      }
    } catch {
      // fail silently
    }
  }

  loadStorage();
}, []);

  return (
    <>
      {showUploadHint && (
        <div style={styles.uploadHint}>Upload your first piece of media 👇</div>
      )}

      {/* Floating button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setShowUploadHint(false);

          if (overLimit) {
            setShowBlockedModal(true);
            return;
          }

          setOpenMenu((prev) => !prev);
        }}
        style={{
          ...styles.fab,
          opacity: overLimit ? 0.5 : 1,
          cursor: overLimit ? "not-allowed" : "pointer",
        }}
        aria-label="Create"
      >
        +
      </button>

      {/* Popup menu */}
      {openMenu && (
        <div ref={menuRef} style={styles.menu}>
          <button
            style={styles.menuItem}
            onClick={() => {
              setFlow("folder");
              setOpenMenu(false);
            }}
          >
            <span style={styles.menuText}>Create Album</span>
          </button>

          <button
            style={{ ...styles.menuItem, borderBottom: "none" }}
            onClick={() => {
              setFlow("media");
              setOpenMenu(false);
            }}
          >
            <span style={styles.menuText}>Upload Media</span>
          </button>
        </div>
      )}

      {/* Modal flow */}
      {flow && (
        <UploadFlowModal
          mode={flow}
          defaultFolderId={defaultFolderId}
          onClose={() => setFlow(null)}
        />
      )}
      {showBlockedModal && (
  <div
    style={styles.blockBackdrop}
    onMouseDown={() => setShowBlockedModal(false)}
  >
    <div
      style={styles.blockModal}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <h3 style={{ marginTop: 0 }}>Uploads Disabled</h3>

      <p style={{ fontSize: 14 }}>
        You are currently in Over-Limit Mode.
        {overLimitDeadline && (
          <>
            <br />
            Reduce storage or upgrade before{" "}
            {new Date(overLimitDeadline).toLocaleDateString()}.
          </>
        )}
      </p>

      <button
        style={styles.blockButton}
        onClick={() => {
          window.location.href = "/settings/billing";
        }}
      >
        Manage Plan
      </button>
    </div>
  </div>
)}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  uploadHint: {
    position: "fixed",
    bottom: 160,
    right: 24,
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 14,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 900,
    color: "var(--text)",
    boxShadow: "0px 14px 40px rgba(0,0,0,0.18)",
    zIndex: 99999,
    maxWidth: 220,
  },

  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 999,
    background: "#2563eb",
    color: "white",
    border: "1px solid rgba(255,255,255,0.25)",
    fontSize: 32,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0px 18px 40px rgba(37,99,235,0.35)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "0px",
  },

  menu: {
    position: "fixed",
    bottom: 92,
    right: 24,
    width: 210,
    background: "white",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0px 16px 40px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 9999,
  },

  menuItem: {
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    background: "white",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 14,
    fontWeight: 900,
    color: "var(--text)",
  },

  menuText: {
    display: "block",
  },

  blockBackdrop: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

blockModal: {
  background: "white",
  padding: 24,
  borderRadius: 16,
  width: 320,
  textAlign: "center",
},

blockButton: {
  marginTop: 16,
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
},
};