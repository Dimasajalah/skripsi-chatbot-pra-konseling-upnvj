// src/components/Modal.jsx
import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 8,
  minWidth: 320,
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: 8,
  right: 12,
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};
