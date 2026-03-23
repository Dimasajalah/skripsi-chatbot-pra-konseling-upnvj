//frontend/chatbot/src/components/NavbarAdmin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logoUPNVJ from "../pages/logo-upnvj.png";

export default function NavbarAdmin() {
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
          <div style={styles.title}>Dashboard Admin</div>
          <div style={styles.subtitle}>
            Universitas Pembangunan Nasional “Veteran” Jakarta
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span style={styles.userName}>
            {user?.full_name || "Admin"}
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
    zIndex: 10,
  },
  left: { display: "flex", alignItems: "center" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  title: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6366f1",
    fontSize: "14px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
  },
  logoutBtn: {
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    cursor: "pointer",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
  },
  logo: {
    width: "40px",
    height: "40px",
    marginRight: "12px",
  },
  
  subtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },  
};
