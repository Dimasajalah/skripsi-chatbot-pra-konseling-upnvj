// frontend/chatbot/src/components/NavbarMahasiswa.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getMahasiswaNotifications, markMahasiswaNotificationRead } from "../api";
import { useEffect } from "react";

export default function NavbarMahasiswa() {
  const navigate = useNavigate();
  const { user, loading, setUser } = useUser();
  const [hoverLogout, setHoverLogout] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  async function fetchNotifications() {
    try {
      const res = await getMahasiswaNotifications();
      setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    }
  }
  
  async function handleMarkRead(notifId) {
    try {
      await markMahasiswaNotificationRead(notifId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notifId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Gagal menandai notifikasi:", err);
    }
  }

  // ⛔ Jangan render navbar sebelum user siap
  if (loading) return null;

  return (
    <header style={styles.nav}>
      <div style={styles.left}>
        <h2 style={styles.title}>Chatbot Pra-Konseling</h2>
      </div>

      <div style={styles.right}>
        <div
          style={styles.userInfo}
          onClick={() => navigate("/profile")}
          title="Lihat Profil"
        >
          <div style={styles.avatar}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "M"}
          </div>
          <span style={styles.userName}>
            {user?.full_name || "Mahasiswa"}
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
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
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
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    cursor: "pointer",
    backgroundColor: "#ef4444",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
};

