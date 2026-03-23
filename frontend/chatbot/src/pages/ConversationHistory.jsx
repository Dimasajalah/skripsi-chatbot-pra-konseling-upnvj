// src/pages/ConversationHistory.jsx
import React from "react";

export default function ConversationHistory({ messages }) {
  return (
    <div className="conversation-history" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "12px", borderRadius: "8px" }}>
      {messages.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>Belum ada percakapan</p>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "8px" }}>
            <b>{msg.from === "user" ? "Mahasiswa" : "Chatbot"}:</b> {msg.text}
            {msg.meta && (
              <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                Emosi: {msg.meta.emotion} ({(msg.meta.emotion_confidence * 100).toFixed(0)}%) • Intent: {msg.meta.intent}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
