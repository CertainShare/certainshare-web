"use client";

import CreateFolderFlow from "@/app/components/flows/CreateFolderFlow";
import UploadMediaFlow from "@/app/components/flows/UploadMediaFlow";

type UploadFlowModalProps = {
  mode: "folder" | "media";
  defaultFolderId?: string | null;
  onClose: () => void;
};

export default function UploadFlowModal({
  mode,
  defaultFolderId = null,
  onClose,
}: UploadFlowModalProps) {
  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>
            {mode === "folder" ? "Create Folder" : "Upload Media"}
          </div>

          <button onClick={onClose} style={styles.close}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {mode === "folder" ? (
            <CreateFolderFlow onClose={onClose} />
          ) : (
            <UploadMediaFlow defaultFolderId={defaultFolderId} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    zIndex: 10000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modal: {
    width: "100%",
    maxWidth: 720,
    background: "white",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0px 30px 70px rgba(0,0,0,0.35)",
    overflow: "hidden",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: 950,
    color: "var(--text)",
  },

  close: {
    border: "none",
    background: "rgba(15,23,42,0.06)",
    width: 36,
    height: 36,
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 900,
  },

  body: {
    padding: 18,
    overflowY: "auto",
  },
};