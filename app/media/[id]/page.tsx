"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";

type UploadItem = {
  id: string;
  url: string;
  visibility: string;
};

export default function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [mediaId, setMediaId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const albumId = searchParams.get("album");
  const isLibrary = searchParams.get("library");

  const [mediaList, setMediaList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [item, setItem] = useState<UploadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMedia(id: string) {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(`/media/${id}`);

      if (!res?.media) {
        throw new Error("Media not found");
      }

    setItem({
      ...res.media,
      url:
        res.media.url ||
        res.media.signed_url ||
        res.media.cloudfront_url ||
        res.media.uri ||
        "",
    });
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function loadContextList(currentId: string) {
    try {
      let list: string[] = [];

      // ✅ Album context
      if (albumId) {
        const res = await apiFetch(`/folders/${albumId}/media`);
        list = (res || []).map((m: any) => m.id);
      }

      // ✅ Other user's uploads
      else if (userId) {
        const res = await apiFetch(`/users/${userId}/uploads`);
        list = (res.uploads || []).map((m: any) => m.id);
      }

      // ✅ Your own uploads
      else if (isLibrary) {
        const res = await apiFetch(`/media/my`);
        list = (res || []).map((m: any) => m.id);
      }

      setMediaList(list);

      const index = list.indexOf(currentId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    } catch {
      setMediaList([]);
    }
  }

  function goNext() {
    if (currentIndex < mediaList.length - 1) {
      const nextId = mediaList[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setMediaId(nextId);

      const query =
        albumId
          ? `?album=${albumId}`
          : userId
          ? `?user=${userId}`
          : isLibrary
          ? `?library=1`
          : "";

      window.history.replaceState(null, "", `/media/${nextId}${query}`);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      const prevId = mediaList[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setMediaId(prevId);

      const query =
        albumId
          ? `?album=${albumId}`
          : userId
          ? `?user=${userId}`
          : isLibrary
          ? `?library=1`
          : "";

      window.history.replaceState(null, "", `/media/${prevId}${query}`);
    }
  }

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // ✅ onboarding/profile gate
      const me = await apiFetch("/users/me", { gateOnboarding: true });
      if (!me) return;

      const resolvedParams = await params;
      setMediaId(resolvedParams.id);
    }

    init();
  }, [params]);

  useEffect(() => {
    if (!mediaId) return;

    const id = mediaId; // capture as definite string

    async function loadAll() {
      await loadMedia(id);
      await loadContextList(id);
    }

    loadAll();
  }, [mediaId]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* LOADING */}
        {loading && <div style={styles.statusText}>Loading...</div>}

        {/* ERROR */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* MEDIA VIEW */}
        {!loading && !error && item && (
          <div style={styles.viewerCard}>
            <div style={styles.viewerTop}>
              <div style={styles.imageStage}>
                <img src={item.url} alt="media" style={styles.image} />

                {/* Back Arrow Overlay */}
                <button
                  onClick={() => window.history.back()}
                  style={styles.viewerBackOverlay}
                >
                  ←
                </button>

                {mediaList.length > 1 && (
                  <>
                    <button onClick={goPrev} style={styles.leftArrow}>
                      ‹
                    </button>
                    <button onClick={goNext} style={styles.rightArrow}>
                      ›
                    </button>
                  </>
                )}

                {/* Visibility Overlay */}
                <div style={styles.imageOverlay}>
                  <span style={styles.visibilityBadge}>
                    {item.visibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#0f172a",
    minHeight: "100vh",
  },

  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 6,
    paddingBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: "-0.6px",
    margin: 0,
    color: "var(--text)",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: 1.5,
    maxWidth: 640,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  backButton: {
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
    boxShadow: "var(--shadow-sm)",
    cursor: "pointer",
  },

  statusText: {
    marginTop: 16,
    color: "var(--muted)",
    fontWeight: 850,
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.18)",
    color: "#991b1b",
    fontWeight: 950,
    fontSize: 13,
  },

  viewerCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  viewerTop: {
    flex: 1,
    display: "flex",
    overflow: "hidden", 
  },

  imageStage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    position: "relative",
  },

  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },

  detailsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },

  detailsLeft: {
    flex: 1,
    minWidth: 200,
  },

  detailsRight: {
    flex: 1,
    minWidth: 200,
    textAlign: "right",
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: 950,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  detailValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 950,
    color: "var(--text)",
  },

  visibilityBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    color: "white",
    backdropFilter: "blur(6px)",
  },

viewerBack: {
  background: "transparent",
  border: "none",
  fontSize: 28,
  fontWeight: 900,
  cursor: "pointer",
  color: "white",
  padding: "8px 10px",
  borderRadius: 8,
},

imageOverlay: {
  position: "absolute",
  bottom: 24,
  left: 24,
},

viewerBackOverlay: {
  position: "absolute",
  top: 20,
  left: 20,
  background: "rgba(0,0,0,0.4)",
  color: "white",
  border: "none",
  fontSize: 26,
  fontWeight: 900,
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: 999,
  backdropFilter: "blur(6px)",
},

leftArrow: {
  position: "absolute",
  left: 20,
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.4)",
  color: "white",
  border: "none",
  fontSize: 36,
  fontWeight: 900,
  cursor: "pointer",
  borderRadius: 999,
  padding: "6px 14px",
  backdropFilter: "blur(6px)",
},

rightArrow: {
  position: "absolute",
  right: 20,
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.4)",
  color: "white",
  border: "none",
  fontSize: 36,
  fontWeight: 900,
  cursor: "pointer",
  borderRadius: 999,
  padding: "6px 14px",
  backdropFilter: "blur(6px)",
},
};