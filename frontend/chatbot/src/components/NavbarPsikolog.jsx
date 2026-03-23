//frontend/chatbot/src/components/NavbarPsikolog.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logoUPNVJ from "../pages/logo-upnvj.png";

export default function NavbarPsikolog() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useUser();
  const [hoverLogout, setHoverLogout] = useState(false);

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  if (loading) return null;

  return (
    <header style={styles.nav}>
      <div style={styles.left}>
        <img src={logoUPNVJ} alt="UPNVJ" style={styles.logo} />
        <div>
          <div style={styles.title}>Dashboard Psikolog</div>
          <div style={styles.subtitle}>
            Universitas Pembangunan Nasional “Veteran” Jakarta
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <span style={styles.userName}>
            {user?.full_name || "Psikolog"}
          </span>
        </div>

        <button
          style={{
            ...styles.logoutBtn,
            backgroundColor: hoverLogout ? "#dc2626" : "#ef4444",
          }}
          onMouseEnter={() => setHoverLogout(true)}
          onMouseLeave={() => setHoverLogout(false)}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 600,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#334155",
  },
  logoutBtn: {
    cursor: "pointer",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
  },
};

