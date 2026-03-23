// frontend/chatbot/src/components/SidebarMahasiswa.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarMahasiswa() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.role}>Mahasiswa</span>
      </div>

      <nav style={styles.navList}>
        <NavLink
          to="/chat"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Chat Pra-Konseling
        </NavLink>

        <NavLink
          to="/hasil-asesmen"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Hasil Asesmen
        </NavLink>

        <NavLink
          to="/profile"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Profil Mahasiswa
        </NavLink>

        <NavLink
          to="/jadwal"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Jadwal Konseling
        </NavLink>

        <NavLink
          to="/booking-konseling"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Ajukan Konseling
        </NavLink>

        <NavLink
          to="/status-tindak-lanjut"
          style={({ isActive }) =>
            isActive
              ? { ...styles.link, ...styles.activeLink }
              : styles.link
          }
        >
          Status Tindak Lanjut
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
    minHeight: "100%",
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
    transition: "all 0.2s ease",
  },
  activeLink: {
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "600",
  },
};
