// frontend/chatbot/src/layouts/Mahasiswalayout.jsx
import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import NavbarMahasiswa from "../components/NavbarMahasiswa";
import SidebarMahasiswa from "../components/SidebarMahasiswa";
import { useUser } from "../context/UserContext";

export default function MahasiswaLayout({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NavbarMahasiswa />
      <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb"}}>
        <SidebarMahasiswa />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </>
  );
}


