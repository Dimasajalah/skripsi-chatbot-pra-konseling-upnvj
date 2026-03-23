// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import {
  getAllChatSessionsAdmin,
  getAdminReportSummary,
  getAllArchivedEmotionsAdmin,
  getAdminNotifications,
} from "../api";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [emotions, setEmotions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getAllChatSessionsAdmin().then((data) => setSessions(data.sessions || []));
    getAdminReportSummary().then((data) => setSummary(data));
    getAllArchivedEmotionsAdmin().then((data) => setEmotions(data.data || []));
    getAdminNotifications().then((data) => setNotifications(data.notifications || []));
  }, []);

  return (
    <AdminLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.headerCard}>
          <h2>Admin Dashboard</h2>
          <p>Monitoring semua sesi chat mahasiswa</p>
        </div>

        {/* Notifikasi */}
        <div style={styles.card}>
          <h3>Notifikasi Admin</h3>
          <div style={styles.scrollBox}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: n.is_read ? "#f3f4f6" : "#fee2e2",
                  }}
                  onClick={() => {
                    if (!n.is_read) {
                      setNotifications((prev) =>
                        prev.map((item) =>
                          item._id === n._id ? { ...item, is_read: true } : item
                        )
                      );
                    }
                  }}
                >
                  <div style={{ fontWeight: n.is_read ? "normal" : "bold", wordBreak: "break-word" }}>
                    Nama Mahasiswa:  {n.mahasiswa_name}
                  </div>
                  <div style={{ wordBreak: "break-word" }}>Pesan: {n.message}</div>
                  <div style={{ wordBreak: "break-word" }}>Status: {n.type}</div>
                  <small style={{ color: "#6b7280" }}>
                    Tanggal dibuat:{n.created_at}
                  </small>
                </div>
              ))
            ) : (
              <p>Tidak ada notifikasi</p>
            )}
          </div>
        </div>

        {/* Grid utama responsive */}
        <div style={styles.grid}>
          {/* Sidebar */}
          <div style={{ ...styles.sidebar, color: "#111827" }}>
            <h3>Daftar Mahasiswa / Sesi</h3>
            <div style={styles.scrollSidebar}>
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <div
                    key={s.session_id}
                    style={{
                      ...styles.sessionItem,
                      background: selectedSession?.session_id === s.session_id ? "#d1e7dd" : "#f9fafb",
                    }}
                    onClick={() => {
                      setSelectedSession(s);
                    }}
                  >
                    <div style={{ wordBreak: "break-word" }}>
                      <p style={styles.sessionName}>{s.user_name || s.user_id}</p>
                      <p style={styles.sessionMeta}>{s.created_at}</p>
                    </div>
                    <span
                      style={{
                        color: s.is_active ? "#16a34a" : "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      {s.is_active ? "Aktif" : "Selesai"}
                    </span>
                  </div>
                ))
              ) : (
                <p>Tidak ada sesi tersedia</p>
              )}
            </div>
          </div>

          {/* Kolom Detail & Cards */}
          <div style={styles.detailColumn}>
            {/* Detail Sesi */}
            <div style={styles.card}>
              {selectedSession ? (
                <>
                  <h3>Detail Sesi</h3>
                  <p><b>Nama:</b> {selectedSession.user_name || "-"}</p>
                  <p><b>Username:</b> {selectedSession.username}</p>

                  <p><b>Risk Level:</b>
                    <span style={{
                      color:
                        (selectedSession.risk_level || "Low") === "High" ? "#dc2626" :
                          (selectedSession.risk_level || "Low") === "Medium" ? "#f59e0b" :
                            "#16a34a",
                      fontWeight: 700
                    }}>
                      {" "}{selectedSession.risk_level}
                    </span>
                  </p>

                  <p><b>Priority:</b> {selectedSession.priority}</p>
                  <p><b>Counseling:</b> {selectedSession.counseling_status}</p>

                  <p><b>Last Emotion:</b> {selectedSession.last_emotion}</p>

                  <p><b>% Positif:</b> {selectedSession.percentage_positive}%</p>
                  <p><b>% Netral:</b> {selectedSession.percentage_neutral}%</p>
                  <p><b>% Negatif:</b> {selectedSession.percentage_negative}%</p>

                  <p><b>Selesai:</b> {selectedSession.ended_at}</p>
                  <p><b>Dibuat oleh:</b> {selectedSession.created_by_role}</p>

                  <p><b>Need Attention:</b>
                    {selectedSession.need_admin_attention ? "Ya" : "Tidak"}
                  </p>

                  <p><b>Critical Detected:</b>
                    {selectedSession.critical_detected ? "Ya" : "Tidak"}
                  </p>

                  <p><b>Status Aktif:</b>
                    {selectedSession.is_active ? "Aktif" : "Selesai"}
                  </p>
                  <div style={{ marginTop: "10px" }}>
                    <b>Detail Distribusi:</b>
                    <p>Senang: {selectedSession.emotion_percentages?.senang_pct ?? 0}%</p>
                    <p>Sedih: {selectedSession.emotion_percentages?.sedih_pct ?? 0}%</p>
                    <p>Marah: {selectedSession.emotion_percentages?.marah_pct ?? 0}%</p>
                    <p>Cemas: {selectedSession.emotion_percentages?.cemas_pct ?? 0}%</p>
                    <p>Netral: {selectedSession.emotion_percentages?.netral_pct ?? 0}%</p>
                  </div>
                  {selectedSession.emotion_history && (
                    <div style={{ marginTop: "15px" }}>
                      <h4>Riwayat Emosi</h4>

                      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {selectedSession.emotion_history.map((e, i) => (
                          <div key={i} style={{
                            borderBottom: "1px solid #e5e7eb",
                            padding: "6px 0"
                          }}>
                            <p><b>Label:</b> {e.label}</p>
                            <p><b>Confidence:</b> {(e.confidence * 100).toFixed(0)}%</p>
                            <p><b>Teks:</b> {e.text}</p>
                            <p><b>Waktu:</b> {e.timestamp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSession.emotion_summary && (
                    <div style={{ marginTop: "15px" }}>
                      <h4>Ringkasan Analisis</h4>

                      <p><b>Risk Level:</b> {selectedSession.emotion_summary.risk_level}</p>
                      <p><b>Total Pesan:</b> {selectedSession.emotion_summary.total_messages}</p>
                      <p><b>Max Negative Streak:</b> {selectedSession.emotion_summary.max_consecutive_negative}</p>
                      <p><b>High Risk Keyword:</b> {selectedSession.emotion_summary.high_risk_keyword_count}</p>
                    </div>
                  )}
                </>
              ) : (
                <p>Pilih sesi di sebelah kiri untuk melihat detail</p>
              )}
            </div>

            {/* Ringkasan */}
            {summary && (
              <div style={styles.card}>
                <h3>Ringkasan Sistem</h3>
                <div style={styles.summaryGrid}>
                  <div><b>Total Sesi Chat:</b> {summary.total_sessions}</div>
                  <div><b>Total Sesi Aktif:</b> {summary.total_active_sessions}</div>
                  <div><b>Total Sesi Critical:</b> {summary.total_critical_sessions}</div>
                  <div><b>Total Hasil Analisis Emosi:</b> {summary.total_emotion_results}</div>
                </div>

                <div>
                  <b>Distribusi Emosi:</b>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Emosi</th>
                        <th style={styles.tableHeader}>Jumlah</th>
                        <th style={styles.tableHeader}>Rata-rata Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.emotion_distribution.map((e, idx) => (
                        <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                          <td style={styles.tableCell}>{e.label || "lainnya"}</td>
                          <td style={styles.tableCell}>{e.count}</td>
                          <td style={styles.tableCell}>{e.avg_confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Semua Data Emosi */}
            <div style={styles.card}>
              <h3>Semua Data Emosi Mahasiswa</h3>

              <div style={styles.emotionScrollBox}>
                {emotions.length > 0 ? (
                  emotions.map((e) => (
                    <div key={e.emotion_id} style={styles.emotionItem}>
                      <p><b>Nama:</b> {e.full_name || "-"}</p>
                      <p><b>Angkatan:</b> {e.angkatan || "-"}</p>
                      <p><b>Risk Level:</b> {e.risk_level || "-"}</p>
                      <p><b>Emosi Terakhir:</b> {e.last_emotion || "-"}</p>
                      <p><b>% Negatif:</b> {e.percentage_negative ?? 0}%</p>
                      <p><b>% Positif:</b> {e.percentage_positive ?? 0}%</p>
                      <p><b>% Netral:</b> {e.percentage_neutral ?? 0}%</p>
                      <p>
                        <b>Dibuat:</b>{" "}
                        {e.created_at
                          ? new Date(e.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Tidak ada data emosi</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "20px",
  },
  emotionScrollBox: {
    maxHeight: "400px",        // tinggi maksimal
    overflowY: "auto",         // aktifkan scroll
    paddingRight: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "12px",
  },
  headerCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    color: "#111827",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(250px, 280px) 1fr",
    gap: "20px",
    width: "100%",
  },
  sidebar: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  scrollSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "8px", // lebih konsisten
    overflowY: "auto",
    maxHeight: "600px",
  },
  sessionName: { margin: 0, fontWeight: 600, color: "#111827" },
  sessionMeta: { fontSize: "12px", color: "#6b7280", margin: 0 },
  detailColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    color: "#111827",
    width: "100%",
    boxSizing: "border-box",
  },
  scrollBox: {
    overflowY: "auto",
    maxHeight: "350px",
    paddingRight: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "10px", // jarak antar notifikasi
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "8px" },
  tableHeader: { borderBottom: "2px solid #d1d5db", textAlign: "left", padding: "8px" },
  tableCell: { padding: "8px" },
  tableRowEven: { backgroundColor: "#f9fafb" },
  tableRowOdd: { backgroundColor: "#ffffff" },
  notificationItem: {
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "12px", // samakan dengan card
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    wordBreak: "break-word",
  },
  sessionItem: {
    padding: "12px",
    borderRadius: "12px", // samakan
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", // subtle shadow
    transition: "all 0.2s ease",
  },
  emotionItem: {
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "12px", // samakan
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    wordBreak: "break-word",
    transition: "all 0.2s ease",
  },
  cardH3: {
    marginTop: 0,
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
  }
};