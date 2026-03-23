//frontend/chatbot/src/pages/NLPResults.jsx
import React from "react";

export default function NLPResults({ latestMessage }) {
  if (!latestMessage || !latestMessage.emotion || !latestMessage.intent) {
    return null;
  }

  const { emotion, intent } = latestMessage;

  const emotionText =
    !emotion.label || emotion.confidence < 0.5
      ? "Belum dapat ditentukan"
      : emotion.label;

  return (
    <div style={{
      marginTop: "16px",
      padding: "12px",
      borderTop: "1px solid #ddd",
      fontSize: "0.9rem",
      color: "#333"
    }}>
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        Informasi Sistem:
      </div>

      <div>
        <b>Emosi</b> : {emotionText}
      </div>

      <div>
        <b>Intent</b> :{" "}
        {intent.confidence < 0.5 || !intent.label
          ? "Belum dapat ditentukan"
          : intent.label}
      </div>

      <div style={{ marginTop: "8px", fontStyle: "italic", fontSize: "0.8rem" }}>
        *Hasil ini bukan diagnosis klinis*
      </div>
    </div>
  );
}
