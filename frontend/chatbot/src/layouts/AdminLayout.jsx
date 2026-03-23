//frontend/chatbot/src/layouts/AdminLayout.jsx
import React from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import NavbarAdmin from "../components/NavbarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <SidebarAdmin />

      <div style={styles.main}>
        <NavbarAdmin />

        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};
