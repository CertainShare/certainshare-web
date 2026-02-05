"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path;
  }

  const activeStyle = {
    border: "1px solid #2563eb",
    boxShadow: "0px 6px 18px rgba(37,99,235,0.2)",
  };

  return (
    <div style={styles.topNavWrapper}>
      <div style={styles.topNavInner}>
        <div style={styles.brand}>CertainShare</div>

        <div style={styles.navIcons}>
          <Link
            href="/feed"
            style={{
              ...styles.navIcon,
              ...(isActive("/feed") ? activeStyle : {}),
            }}
            title="Feed"
          >
            🏠
          </Link>

          <Link
            href="/notifications"
            style={{
              ...styles.navIcon,
              ...(isActive("/notifications") ? activeStyle : {}),
            }}
            title="Notifications"
          >
            🔔
          </Link>

          <Link
            href="/friends"
            style={{
              ...styles.navIcon,
              ...(isActive("/friends") ? activeStyle : {}),
            }}
            title="Friends"
          >
            👥
          </Link>

          <Link
            href="/mymedia"
            style={{
              ...styles.navIcon,
              ...(isActive("/mymedia") ? activeStyle : {}),
            }}
            title="Profile"
          >
            👤
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topNavWrapper: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: "rgba(246,247,251,0.95)",
    backdropFilter: "blur(10px)",
    paddingBottom: 14,
    marginBottom: 18,
  },

  topNavInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 30,
  },

  brand: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827",
  },

  navIcons: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  navIcon: {
    textDecoration: "none",
    fontSize: 20,
    padding: 10,
    borderRadius: 12,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0px 6px 18px rgba(0,0,0,0.06)",
  },
};