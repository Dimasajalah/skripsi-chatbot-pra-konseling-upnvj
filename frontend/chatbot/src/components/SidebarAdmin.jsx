// frontend/chatbot/src/components/SidebarAdmin.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarAdmin() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.role}>Admin</span>
      </div>

      <nav style={styles.navList}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/counseling-requests"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Permohonan Konseling
        </NavLink>

        <NavLink
          to="/admin/users"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Manajemen Pengguna
        </NavLink>
        <NavLink
          to="/admin/critical-cases"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Daftar Kasus Kritis Mahasiswa
        </NavLink>

        <NavLink
          to="/admin/archived-emotions"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Riwayat Emosi
        </NavLink>

        <NavLink
          to="/admin/profile"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...styles.activeLink } : styles.link
          }
        >
          Profil Admin
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
    transition: "all 0.2s ease",
  },
  activeLink: {
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "600",
  },
};


