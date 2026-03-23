// frontend/chatbot/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function PrivateRoute({ role, children }) {
  const { user, loading } = useUser();

  // ⬅️ 1. TUNGGU DULU
  if (loading) {
    return <div style={{ padding: 20 }}>Memeriksa autentikasi...</div>;
  }

  // ⬅️ 2. BARU CEK USER
  if (!user) {
    if (role === "mahasiswa") return <Navigate to="/login" replace />;
    if (role === "admin") return <Navigate to="/admin/login" replace />;
    if (role === "psikolog") return <Navigate to="/psikolog/login" replace />;
    return <Navigate to="/login" replace />;
  }

  // ⬅️ 3. ROLE CHECK
  if (role && user.role !== role) {
    if (user.role === "mahasiswa") return <Navigate to="/chat" replace />;
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    if (user.role === "psikolog") return <Navigate to="/psikolog/dashboard" replace />;
  }

  return children;
}


