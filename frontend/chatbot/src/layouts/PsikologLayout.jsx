//frontend/chatbot/src/layouts/PsikologLayout.jsx
import React from "react";
import SidebarPsikolog from "../components/SidebarPsikolog";
import NavbarPsikolog from "../components/NavbarPsikolog";

export default function PsikologLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <SidebarPsikolog />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <NavbarPsikolog />
        <main style={styles.main}>{children}</main>
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
    padding: "32px",
  },
};
