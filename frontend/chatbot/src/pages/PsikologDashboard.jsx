// src/pages/PsikologDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import PsikologLayout from "../layouts/PsikologLayout";
import {
  getPsikologSessions,
  getSessionMessages, // buat admin
  getPsikologEmotionResult,
  getPsikologNotifications,
  markPsikologNotificationRead,
  sendFollowUpNotification,
  getCriticalMahasiswa,
} from "../api";
import logoUPNVJ from "../pages/logo-upnvj.png";

export default function PsikologDashboard() {
  const [sessions, setSessions] = useState([]);
  const [activeChatbotSession, setActiveChatbotSession] = useState(null);
  const [activeCounselingSession, setActiveCounselingSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [emotionResult, setEmotionResult] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chatbotSessions, setChatbotSessions] = useState([]);
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingEmotion, setLoadingEmotion] = useState(false);

  const messagesEndRef = useRef(null);
  const activeSession = activeChatbotSession ?? activeCounselingSession;
  const [selectedCritical, setSelectedCritical] = useState(null);

  /* ================= FETCH SESSIONS ================= */
  useEffect(() => {
    getPsikologSessions()
      .then((res) => setSessions(res.sessions || []))
      .catch(console.error);
  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */
  useEffect(() => {
    getPsikologNotifications()
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  /* ================= FETCH MESSAGES & EMOTION ================= */
  useEffect(() => {
    if (!activeSession?._id) return;

    getSessionMessages(activeSession._id)
      .then((res) => setMessages(res.messages || []))
      .catch(console.error);

    if (!activeChatbotSession) {
      setEmotionResult(null);
      setLoadingEmotion(true);

      getPsikologEmotionResult(activeSession._id)
        .then((res) => {
          console.log("Emotion API:", res);

          const data = res?.data || res;

          if (Array.isArray(data)) {
            setEmotionResult(data[0] || null); // ambil yang terbaru
          } else {
            setEmotionResult(data);
          }
        })
        .catch(() => {
          setEmotionResult(null);
        })
        .finally(() => {
          setLoadingEmotion(false);
        });
    } else {
      setEmotionResult(null);
    }
  }, [activeChatbotSession, activeCounselingSession]);

  /* ================= AUTOSCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= FETCH CRITICAL MAHASISWA ================= */
  useEffect(() => {
    getCriticalMahasiswa()
      .then((res) => {
        const formatted = (res.data || []).map((item) => ({
          ...item,
          student_name: item.full_name,   // ✅ fix
          _id: item.session_id,
          status: "critical",
          detected_at: item.detected_at,
          last_emotion: item.last_emotion,
          emotion_history: item.emotion_history || [],
        }));
        setChatbotSessions(formatted);
      })
      .catch(() => setChatbotSessions([]));
  }, []);

  /* ================= HANDLERS ================= */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await markPsikologNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch {
      showToast("Gagal menandai notifikasi", "error");
    }
  };

  const handleSendFollowUp = async () => {
    if (!activeChatbotSession || !activeChatbotSession.mahasiswa_id) {
      showToast("Mahasiswa tidak valid", "error");
      return;
    }

    setIsSendingNotif(true);
    try {
      await sendFollowUpNotification({
        mahasiswa_id: activeChatbotSession.mahasiswa_id,
        session_id: activeChatbotSession.session_id,
        message:
          "Kami mendeteksi Anda membutuhkan bantuan. Layanan konseling tersedia.",
      });
      showToast("Notifikasi berhasil dikirim ke mahasiswa");
    } catch (err) {
      showToast(err.message || "Gagal mengirim notifikasi", "error");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const hiddenEmotionFields = [
    "emotion_id",
    "session_id",
    "mahasiswa_id",
  ];

  function renderEmotionValue(key, value) {
    if (value === null || value === undefined) return "-";

    if (key === "emotion_distribution" && typeof value === "object") {
      return Object.entries(value)
        .filter(([k]) => k !== "total")
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }

    if (key === "created_at") {
      return new Date(value).toLocaleString();
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    if (typeof value === "number" && key.includes("percentage")) {
      return `${value}%`;
    }

    if (key === "risk_level") {
      const color =
        value === "high"
          ? "#ef4444"
          : value === "medium"
            ? "#f59e0b"
            : "#22c55e";

      return (
        <span
          style={{
            background: color,
            color: "white",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {value}
        </span>
      );
    }

    return String(value);
  }

  function formatLabel(key) {
    const labels = {
      mahasiswa_name: "Nama Mahasiswa",
      risk_level: "Tingkat Risiko",
      percentage_negative: "Persentase Negatif",
      percentage_positive: "Persentase Positif",
      percentage_neutral: "Persentase Netral",
      total_messages: "Total Pesan",
      max_consecutive_negative: "Negatif Berturut Maks",
      average_negative_streak: "Rata-rata Negatif Berturut",
      last_emotion: "Emosi Terakhir",
      emotion_distribution: "Distribusi Emosi",
      created_at: "Tanggal Analisis",
    };

    return labels[key] || key.replace(/_/g, " ");
  }

  function EmotionDistribution({ data }) {
    if (!data || Object.keys(data).length === 0) {
      return <p>Tidak ada data distribusi emosi</p>;
    }

    return (
      <div style={{ marginTop: 16 }}>
        <h4>Distribusi Emosi</h4>

        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {Object.entries(data)
            .filter(([k]) => k !== "total")
            .map(([label, count]) => (
              <div
                key={label}
                style={{
                  flex: Math.max(count, 1),
                  background: "#60a5fa",
                  color: "white",
                  fontSize: 11,
                  textAlign: "center",
                  padding: "4px 0",
                  borderRadius: 6,
                }}
              >
                {label} ({count})
              </div>
            ))}
        </div>
      </div>
    );
  }

  function ProgressBar({ label, value, color }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <div
          style={{
            height: 8,
            background: "#e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Number(value) || 0}%`,
              height: "100%",
              background: color,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <PsikologLayout>
      <div style={styles.page}>
        {/* HEADER */}
        <div style={styles.headerCard}>
          <img src={logoUPNVJ} alt="UPNVJ" style={{ width: 40, marginRight: 12 }} />
          <div>
            <h2 style={{ margin: 0 }}>Dashboard Psikolog</h2>
            <p style={{ margin: 0, fontSize: 14 }}>Monitoring Chat Pra-Konseling</p>
          </div>
        </div>

        {/* FLEX UTAMA */}
        <div style={styles.flexMain}>
          {/* SIDEBAR KIRI */}
          <div style={styles.sidebar}>
            <h3>Mahasiswa CRITICAL</h3>
            <select
              value={activeChatbotSession?._id || ""}
              style={{ padding: 8, width: "100%" }}
              onChange={(e) => {
                const session = chatbotSessions.find(
                  (s) => String(s.session_id) === String(e.target.value)
                );
                if (!session) return;
                setActiveChatbotSession({ ...session, _id: session.session_id });
                setSelectedCritical(session);
                setActiveCounselingSession(null);
              }}
            >
              <option value="">Pilih mahasiswa</option>
              {chatbotSessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.student_name} — {s.detected_at}
                </option>
              ))}
            </select>
            {selectedCritical && (
              <div style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                background: "#fff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
              }}>
                <h4 style={{ marginBottom: 6 }}>
                  {selectedCritical.student_name}
                </h4>

                <p style={{ fontSize: 12, color: "#6b7280" }}>
                  {selectedCritical.detected_at}
                </p>

                {/* 🔥 LAST EMOTION BADGE */}
                <div style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 20,
                  background:
                    selectedCritical.last_emotion === "cemas"
                      ? "#fef3c7"
                      : "#e0f2fe",
                  fontSize: 12,
                  marginBottom: 10,
                  fontWeight: 600
                }}>
                  {selectedCritical.last_emotion}
                </div>

                {/* 🔥 EMOTION HISTORY */}
                <div style={{ marginTop: 8 }}>
                  <h5 style={{ fontSize: 13 }}>Riwayat Emosi</h5>

                  <div style={{
                    maxHeight: 150,
                    overflowY: "auto",
                    marginTop: 6
                  }}>
                    {(selectedCritical.emotion_history || []).map((e, i) => (
                      <div key={i} style={{
                        padding: 8,
                        borderRadius: 8,
                        background: "#f9fafb",
                        marginBottom: 6,
                        border: "1px solid #e5e7eb"
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>
                          {e.label} ({Math.round((e.confidence || 0) * 100)}%)
                        </div>

                        <div style={{ fontSize: 12, color: "#374151" }}>
                          {e.text}
                        </div>

                        <div style={{ fontSize: 10, color: "#9ca3af" }}>
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 16 }}>Sesi Mahasiswa</h3>
            <div style={styles.scrollContainer}>
              {sessions.length === 0 && <p>Tidak ada sesi mahasiswa</p>}
              {sessions.map((s) => (
                <div
                  key={s.session_id}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 6,
                    cursor: "pointer",
                    backgroundColor:
                      activeCounselingSession?._id === s.session_id ? "#d1e7dd" : "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                  onClick={() => {
                    setActiveCounselingSession({ ...s, _id: s.session_id });
                    setActiveChatbotSession(null);
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#111827" }}>{s.mahasiswa_name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {s.date} {s.time} — {s.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={styles.detailColumn}>
            {/* CHAT */}
            <div style={{ ...styles.card, ...styles.scrollCard }}>
              {!activeSession && <p>Pilih sesi untuk melihat percakapan mahasiswa.</p>}
              {messages.map((msg, i) => {
                const isBot = msg.sender === "chatbot";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isBot ? "flex-start" : "flex-end",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        backgroundColor: isBot ? "#f3f4f6" : "#d1fae5",
                        maxWidth: "70%",
                        lineHeight: 1.5,
                        color: "#111827",
                      }}
                    >
                      {isBot ? (
                        <>
                          {msg.empathetic_text && <p style={{ margin: 0 }}>{msg.empathetic_text}</p>}
                          {msg.suggestion && <p style={{ margin: 0 }}><b>Saran:</b> {msg.suggestion}</p>}
                          {msg.cta && <p style={{ margin: 0 }}><b>CTA:</b> {msg.cta}</p>}
                        </>
                      ) : (
                        <p style={{ margin: 0 }}>{msg.text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* EMOTION RESULT */}
            {loadingEmotion && <p>Memuat analisis emosi...</p>}

            {!loadingEmotion && emotionResult && (
              <div style={{ ...styles.card, ...styles.scrollCard }}>
                <h3>Hasil Analisis Emosi</h3>

                <div style={styles.emotionScrollBox}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 12,
                      marginTop: 10
                    }}
                  >
                    {emotionResult.risk_level && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          borderRadius: 8,
                          background:
                            emotionResult.risk_level === "high"
                              ? "#fee2e2"
                              : emotionResult.risk_level === "medium"
                                ? "#fef3c7"
                                : "#dcfce7",
                          border: "1px solid #e5e7eb",
                          fontWeight: 600,
                        }}
                      >
                        <div style={styles.riskBadge}>
                          Risiko: {emotionResult.risk_level.toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 8 }}>Persentase Emosi</h4>

                      <ProgressBar
                        label="Negatif"
                        value={emotionResult.percentage_negative || 0}
                        color="#ef4444"
                      />

                      <ProgressBar
                        label="Netral"
                        value={emotionResult.percentage_neutral || 0}
                        color="#6b7280"
                      />

                      <ProgressBar
                        label="Positif"
                        value={emotionResult.percentage_positive || 0}
                        color="#22c55e"
                      />
                      {/* Statistik Percakapan */}
                      <div style={styles.statSection}>
                        <h4 style={styles.sectionTitle}>Statistik Percakapan</h4>
                        <div style={styles.insightGrid}>

                          <div style={styles.insightCard}>
                            <span style={styles.insightLabel}>Emosi Terakhir</span>
                            <strong>{emotionResult.last_emotion || "-"}</strong>
                          </div>

                          <div style={styles.insightCard}>
                            <span style={styles.insightLabel}>Total Pesan Dianalisis</span>
                            <strong>{emotionResult.total_messages || 0}</strong>
                          </div>

                          <div style={styles.insightCard}>
                            <span style={styles.insightLabel}>Negatif Berturut Maks</span>
                            <strong>{emotionResult.max_consecutive_negative || 0}</strong>
                          </div>

                          <div style={styles.insightCard}>
                            <span style={styles.insightLabel}>Rata-rata Negatif</span>
                            <strong>{emotionResult.average_negative_streak || 0}</strong>
                          </div>

                        </div>

                        <div style={styles.statGrid}>
                          <div style={styles.statItem}>
                            <span>Total Pesan</span>
                            <strong>{emotionResult.total_messages}</strong>
                          </div>

                          <div style={styles.statItem}>
                            <span>Emosi Terakhir</span>
                            <strong>{emotionResult.last_emotion}</strong>
                          </div>

                          <div style={styles.statItem}>
                            <span>Negatif Berturut Maks</span>
                            <strong>{emotionResult.max_consecutive_negative}</strong>
                          </div>

                          <div style={styles.statItem}>
                            <span>Rata-rata Negatif</span>
                            <strong>{emotionResult.average_negative_streak}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={styles.distributionSection}>
                      <h4 style={styles.sectionTitle}>Distribusi Emosi</h4>
                      <EmotionDistribution
                        key={JSON.stringify(emotionResult.emotion_distribution)}
                        data={emotionResult.emotion_distribution}
                      />
                    </div>
                    <div style={styles.analysisInfo}>
                      Analisis terakhir:{" "}
                      {emotionResult.created_at
                        ? new Date(emotionResult.created_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR KANAN */}
          <div style={{ ...styles.card, ...styles.scrollCard }}>
            <h3>Notifikasi</h3>
            <div style={styles.scrollContainer}>
              {notifications.length === 0 ? (
                <p>Tidak ada notifikasi</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: n.is_read ? "#f3f4f6" : "#fee2e2",
                      border: "1px solid #e5e7eb",
                      cursor: n.is_read ? "default" : "pointer",
                      fontWeight: n.is_read ? "normal" : "bold",
                      color: "#111827",
                    }}
                    onClick={() => !n.is_read && handleMarkNotificationRead(n.id)}
                  >
                    <div>{n.message}</div>
                    <small style={{ color: "#6b7280" }}>
                      {n.created_at}
                    </small>
                  </div>
                ))
              )}
            </div>

            {activeSession && (
              <div style={{ ...styles.card, ...styles.scrollCard }}>
                <h4>Detail Sesi</h4>
                <p><b>Mahasiswa:</b> {activeSession.student_name}</p>
                <p><b>Status:</b> {activeSession.status}</p>
                {activeSession.date && (
                  <p><b>Jadwal:</b> {activeSession.date} {activeSession.time}</p>
                )}
              </div>
            )}

            <button
              onClick={handleSendFollowUp}
              disabled={isSendingNotif}
              style={{
                marginTop: 12,
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {isSendingNotif ? "Mengirim..." : "Kirim Notifikasi"}
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "12px 20px",
            borderRadius: 8,
            color: "white",
            background: toast.type === "error" ? "#dc2626aa" : "#16a34a",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
    </PsikologLayout>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "20px",
  },
  headerCard: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    gap: 12,
    color: "#111827",
  },
  emotionBox: {
    background: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 70,
    wordBreak: "break-word",
    gap: 4,
    fontSize: 14,
  },
  flexMain: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 300px",
    gap: "20px",
    width: "100%",
    alignItems: "start"
  },
  sidebar: {
    background: "#f3f4f6",
    padding: "20px",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 240,
    height: "calc(100vh - 160px)",
    overflowY: "auto",
    color: "#111827",
  },
  mainContent: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    color: "#111827",
    width: "100%",
    boxSizing: "border-box",
  },
  scrollContainer: {
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  emotionScrollBox: {
    maxHeight: "320px",
    overflowY: "auto",
    paddingRight: "6px",
    marginTop: "12px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "12px"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
  },

  statSection: {
    marginTop: 20,
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
  },

  statItem: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
  },

  distributionSection: {
    marginTop: 20,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
  },
  detailColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  riskBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 600,
    fontSize: 13,
  },
};
