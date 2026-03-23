//frontend/chatbot/src/pages/HasilAsesmenPsikolog.jsx
import { useEffect, useState } from "react";
import PsikologLayout from "../layouts/PsikologLayout";
import {
  getCompletedSessions,
  getPsikologEmotionResult,
} from "../api";

export default function HasilAsesmenPsikolog() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [emotionData, setEmotionData] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingEmotion, setLoadingEmotion] = useState(false);
  const [error, setError] = useState(null);

  // ===============================
  // LOAD COMPLETED SESSIONS
  // ===============================
  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getCompletedSessions();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSessions(false);
      }
    }

    fetchSessions();
  }, []);

  // ===============================
  // HANDLE SELECT SESSION
  // ===============================
  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setEmotionData([]);
    setLoadingEmotion(true);
    setError(null);

    try {
      const data = await getPsikologEmotionResult(session.session_id);
      setEmotionData(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEmotion(false);
    }
  };

  // ===============================
  // RISK COLOR BADGE
  // ===============================
  const getRiskColor = (risk) => {
    if (!risk) return "#999";
    if (risk.toLowerCase() === "high") return "#e53935";
    if (risk.toLowerCase() === "medium") return "#fb8c00";
    if (risk.toLowerCase() === "low") return "#43a047";
    return "#1976d2";
  };

  return (
    <PsikologLayout>
      <div
        style={{
          padding: "30px",
          maxWidth: "1200px",
          margin: "0 auto",
          color: "#222", // PASTIKAN SEMUA TEKS GELAP
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#222" }}>
          Hasil Asesmen Emosi Mahasiswa
        </h2>

        {error && (
          <div
            style={{
              background: "#fdecea",
              color: "#c62828",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {/* ===============================
            SESSION LIST (SCROLLABLE)
        =============================== */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#222" }}>
            Sesi Konseling Selesai
          </h3>

          <div
            style={{
              maxHeight: "300px",   // SCROLL AREA
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {loadingSessions ? (
              <p>Memuat sesi...</p>
            ) : sessions.length === 0 ? (
              <p>Tidak ada sesi selesai.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => handleSelectSession(session)}
                  style={{
                    padding: "14px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    background: "#f9fafb",
                    border:
                      selectedSession?.session_id === session.session_id
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eef4ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                >
                  <strong>{session.mahasiswa_name}</strong>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                  Tanggal Sesi: {session.date} 
                  </div>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                  Tanggal Waktu: {session.time}
                  </div>
                  <div style={{ fontSize: "13px", color: "#777" }}>
                    Status: {session.status}
                  </div>
                  <div style={{ fontSize: "13px", color: "#777" }}>
                    Tanggal sesi selesai: {session.completed_at}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===============================
            EMOTION RESULT DETAIL (SCROLLABLE)
        =============================== */}
        {selectedSession && (
          <div>
            <h3 style={{ marginBottom: "15px", color: "#222" }}>
              Detail Asesmen: {selectedSession.mahasiswa_name}
            </h3>

            {loadingEmotion ? (
              <p>Memuat hasil asesmen...</p>
            ) : emotionData.length === 0 ? (
              <p>Tidak ada data asesmen.</p>
            ) : (
              <div
                style={{
                  maxHeight: "500px", // SCROLL AREA DETAIL
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {emotionData.map((emotion) => (
                  <div
                    key={emotion.emotion_id}
                    style={{
                      background: "#ffffff",
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <span
                        style={{
                          background: getRiskColor(emotion.risk_level),
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                        }}
                      >
                        Risk Level: {emotion.risk_level}
                      </span>
                    </div>
                    <p><strong>Total Messages:</strong> {emotion.total_messages}</p>
                    <p><strong>Negative %:</strong> {emotion.percentage_negative}%</p>
                    <p><strong>Positive %:</strong> {emotion.percentage_positive}%</p>
                    <p><strong>Neutral %:</strong> {emotion.percentage_neutral}%</p>
                    <p><strong>Max Consecutive Negative:</strong> {emotion.max_consecutive_negative}</p>
                    <p><strong>Average Negative Streak:</strong> {emotion.average_negative_streak}</p>
                    <p><strong>Last Emotion:</strong> {emotion.last_emotion}</p>

                    <div
                      style={{
                        marginTop: "8px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {emotion.emotion_distribution &&
                        Object.entries(emotion.emotion_distribution).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              style={{
                                background: "#f5f7fa",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                color: "#333",
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <strong style={{ textTransform: "capitalize" }}>
                                {key}
                              </strong>
                              <div>{value}</div>
                            </div>
                          )
                        )}
                    </div>

                    <p style={{ marginTop: "10px", fontSize: "13px", color: "#666" }}>
                      Analisis dibuat:{" "}
                      {emotion.created_at
                        ? new Date(emotion.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PsikologLayout>
  );
}