// frontend/chatbot/src/components/EmotionResultCard.jsx
import React from "react";

export default function EmotionResultCard({ result }) {
  if (!result) return null;

  const formattedDate = result.created_at
    ? new Date(result.created_at).toLocaleString("id-ID")
    : "-";

  const confidence = result.tingkat_kepercayaan
    ? (result.tingkat_kepercayaan * 100).toFixed(1)
    : "0";

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 18,
        marginBottom: 16,
        backgroundColor: "#ffffff",
        color: "#000",
      }}
    >
      <h3 style={{ marginBottom: 12, fontWeight: 600 }}>
        Hasil Asesmen Emosi
      </h3>

      <p><strong>Nama Mahasiswa:</strong> {result.mahasiswa_name || "-"}</p>
      <p><strong>ID Mahasiswa:</strong> {result.mahasiswa_id || "-"}</p>
      <p><strong>Emosi Dominan:</strong> {result.label_emosi || "-"}</p>
      <p><strong>Tingkat Kepercayaan:</strong> {confidence}%</p>
      <p><strong>Tanggal Asesmen:</strong> {formattedDate}</p>
      <p><strong>ID Sesi:</strong> {result.session_id || "-"}</p>

      <p style={{ fontSize: 12, marginTop: 10 }}>
        ID Emosi: {result.emotion_id || "-"}
      </p>
    </div>
  );
}
