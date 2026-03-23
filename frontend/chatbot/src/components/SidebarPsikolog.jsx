//frontend/chatbot/src/components/SidebarPsikolog.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarPsikolog() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.role}>Psikolog</span>
      </div>

      <nav style={styles.navList}>
        <NavLink
          to="/psikolog/dashboard"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/psikolog/schedule"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Siapkan Jadwal
        </NavLink>
        <NavLink
          to="/psikolog/hasil-asesmen"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Hasil Asesmen
        </NavLink>

        <NavLink
          to="/psikolog/profile"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Profil Psikolog
        </NavLink>
        <NavLink
          to="/psikolog/archived-emotions"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Arsip Emosi Mahasiswa
        </NavLink>
        <NavLink
          to="/psikolog/confirmed-sessions"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Sesi Dikonfirmasi
        </NavLink>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  role: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  },
  activeLink: {
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "600",
  },
};
