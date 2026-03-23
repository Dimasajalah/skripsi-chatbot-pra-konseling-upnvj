// frontend/chatbot/src/pages/JadwalKonseling.jsx
import React, { useEffect, useState } from "react";
import { getMySessions } from "../api";
import MahasiswaLayout from "../layouts/MahasiswaLayout";

export default function JadwalKonseling() {
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    fetchMySessions();
  }, []);

  async function fetchMySessions() {
    setLoading(true);
    try {
      const myRes = await getMySessions();
      setMySessions(myRes.sessions || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal memuat jadwal Anda" });
    } finally {
      setLoading(false);
    }
  }

  const toggleNotes = (sessionId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const formatDateTime = (dateTimeStr) => dateTimeStr || "-";
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "-";
  const formatTime = (timeStr) => timeStr || "-";

  const getStatusBadgeColor = (status) => {
    const colors = {
      requested: { bg: "#fef3c7", text: "#d97706" },
      confirmed: { bg: "#d1fae5", text: "#059669" },
      rejected: { bg: "#fee2e2", text: "#dc2626" },
      scheduled: { bg: "#dbeafe", text: "#2563eb" }
    };
    return colors[status] || { bg: "#e5e7eb", text: "#6b7280" };
  };

  return (
    <MahasiswaLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 0" }}>
        <h2 style={{ marginBottom: "32px", fontSize: "2rem", fontWeight: "700", color: "#1f2937" }}>
          Jadwal Konseling Saya
        </h2>

        {message && (
          <div
            style={{
              background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${message.type === "success" ? "#86efac" : "#fecaca"}`,
              color: message.type === "success" ? "#166534" : "#991b1b",
              padding: "16px 20px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "16px"
            }}
          >
            {message.text}
          </div>
        )}

        {loading && <p style={{ color: "#6b7280", fontSize: "16px" }}>Memuat data jadwal...</p>}

        {!loading && mySessions.length === 0 && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: "18px" }}>Anda belum memiliki jadwal konseling yang dijadwalkan.</p>
          </div>
        )}

        {!loading && mySessions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {mySessions.map((session) => {
              const statusColor = getStatusBadgeColor(session.status);
              const isNotesExpanded = expandedNotes[session.session_id] || false;

              return (
                <div key={session.session_id} style={styles.sessionCard}>
                  {/* Header */}
                  <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "20px" }}>
                    {session.psychologist_name}
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "16px" }}>
                    <span style={{ background: statusColor.bg, color: statusColor.text, padding: "6px 14px", borderRadius: "24px", fontSize: "14px", fontWeight: "600" }}>
                      {session.status === "requested" && "Menunggu Psikolog"}
                      {session.status === "confirmed" && "Dikonfirmasi"}
                      {session.status === "rejected" && "Ditolak"}
                      {session.status === "scheduled" && "Terjadwal"}
                    </span>
                  </div>

                  {/* Session Info */}
                  <div style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8" }}>
                    <p><strong>Tanggal sesi:</strong> {formatDate(session.date)} </p>
                    <p><strong>Waktu sesi:</strong> {formatTime(session.time)} </p>
                    <p><strong>Jadwal dikonfirmasi:</strong> {formatDateTime(session.scheduled_at)} </p>
                    <p><strong>Mahasiswa:</strong> {session.mahasiswa_name} </p>
                    <p><strong>Nama Psikolog: </strong>{session.psychologist_name}</p>
                  </div>

                  {/* Notes History Toggle */}
                  {session.notes_history && session.notes_history.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <button
                        onClick={() => toggleNotes(session.session_id)}
                        style={{
                          fontSize: "15px",
                          color: "#2563eb",
                          fontWeight: "600",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        {isNotesExpanded ? "Sembunyikan Catatan Psikolog" : "Lihat Catatan Psikolog"}
                      </button>

                      {isNotesExpanded && (
                        <ul style={{ paddingLeft: "20px", fontSize: "15px", color: "#374151", marginTop: "10px" }}>
                          {session.notes_history.map((note, idx) => (
                            <li key={idx} style={{ marginBottom: "8px" }}>
                              <span style={{ fontWeight: "600" }}>{note.psychologist_name}:</span>{" "}
                              {note.notes} <em style={{ color: "#6b7280" }}>({note.status})</em>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  {session.messages && session.messages.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <p style={{ fontWeight: "600", marginBottom: "8px", color: "#374151", fontSize: "16px" }}>
                        Percakapan dengan psikolog:
                      </p>
                      <ul style={{ paddingLeft: "20px", fontSize: "15px", color: "#374151" }}>
                        {session.messages.map((msg, idx) => (
                          <li key={idx} style={{ marginBottom: "6px" }}>
                            <span style={{ fontWeight: "600" }}>{msg.sender}:</span> {msg.text}{" "}
                            <em style={{ color: "#6b7280" }}>({formatDateTime(msg.timestamp)})</em>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Emotions */}
                  {session.emotion_history && session.emotion_history.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <p style={{ fontWeight: "600", marginBottom: "8px", color: "#374151", fontSize: "16px" }}>Riwayat Emosi:</p>
                      <p style={{ fontSize: "15px", color: "#374151" }}>{session.emotion_history.join(", ")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MahasiswaLayout>
  );
}

const styles = {
  sessionCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  emptyState: {
    background: "#f9fafb",
    padding: "40px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    fontSize: "18px"
  }
};




