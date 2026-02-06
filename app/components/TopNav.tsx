"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Users, User } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path;
  }

  return (
    <div style={styles.topNavWrapper}>
      <div style={styles.topNavInner}>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          CertainShare
        </div>

        <div style={styles.navIcons}>
          <Link
            href="/feed"
            style={{
              ...styles.navIcon,
              ...(isActive("/feed") ? styles.navIconActive : {}),
            }}
            title="Feed"
          >
            <Home size={18} />
          </Link>

          <Link
            href="/notifications"
            style={{
              ...styles.navIcon,
              ...(isActive("/notifications") ? styles.navIconActive : {}),
            }}
            title="Notifications"
          >
            <Bell size={18} />
          </Link>

          <Link
            href="/friends"
            style={{
              ...styles.navIcon,
              ...(isActive("/friends") ? styles.navIconActive : {}),
            }}
            title="Friends"
          >
            <Users size={18} />
          </Link>

          <Link
            href="/mymedia"
            style={{
              ...styles.navIcon,
              ...(isActive("/mymedia") ? styles.navIconActive : {}),
            }}
            title="My Media"
          >
            <User size={18} />
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
    background: "rgba(246,247,251,0.9)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(229,231,235,0.8)",
  },

  topNavInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 22,
    paddingTop: 14,
    paddingBottom: 14,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "-0.2px",
    color: "#0f172a",
  },

  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#2563eb",
    boxShadow: "0px 6px 16px rgba(37,99,235,0.35)",
  },

  navIcons: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: 6,
    borderRadius: 16,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(229,231,235,0.9)",
    boxShadow: "0px 8px 20px rgba(15,23,42,0.05)",
  },

  navIcon: {
    width: 42,
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    borderRadius: 14,
    color: "#475569",
    transition: "all 0.15s ease",
  },

  navIconActive: {
    background: "rgba(37,99,235,0.12)",
    color: "#2563eb",
  },
};