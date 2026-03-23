//frontend/chatbot/src/pages/StatusTindakLanjut.jsx
import React, { useEffect, useState } from "react";
import MahasiswaLayout from "../layouts/MahasiswaLayout";
import { getMahasiswaNotifications, markMahasiswaNotificationRead, getMySessions, getLatestAssessment, getPsikologRecommendationBySession, respondSession, getMahasiswaSessionNotes } from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export default function StatusTindakLanjut() {
  const [sessions, setSessions] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [notifications, setNotifications] = useState(
    /** @type {Array<{
     * id: string,
     * type: string,
     * session_id: string | null,
     * message: string,
     * created_at: string,
     * is_read: boolean,
     * psychologist_full_name: string,
     * session_date: string,
     * session_time: string,
     * session_status: string
     * }>} */ ([]));

  useEffect(() => {
    fetchMySessions();
    fetchNotifications();
    fetchAllSessionNotes();
  }, []);

  async function fetchAllSessionNotes() {
    try {
      const data = await getMySessions();
      const allNotes = [];

      for (const s of data.sessions || []) {
        try {
          const res = await getMahasiswaSessionNotes(s.session_id);
          if (res.notes && res.notes.length > 0) {
            allNotes.push({
              session_id: s.session_id,
              notes: res.notes
            });
          }
        } catch (err) { }
      }

      setSessionNotes(allNotes);
    } catch (err) {
      console.error("Gagal ambil semua catatan:", err);
    }
  }

  async function fetchMySessions() {
    setLoading(true);
    try {
      const data = await getMySessions();

      const updatedSessions = await Promise.all(
        (data.sessions || []).map(async (s) => {
          let updated = { ...s };

          // recommendation hanya kalau confirmed
          if (s.status === "confirmed") {
            try {
              const rec = await getPsikologRecommendationBySession(s.session_id);
              updated.recommendation = rec.recommendation;
            } catch (e) {
              console.error("Gagal ambil rekomendasi:", e);
            }
          }

          // notes untuk SEMUA status

          return updated;
        })
      );

      setSessions(updatedSessions);

    } catch (err) {
      console.error("Gagal mengambil status tindak lanjut:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotifications() {
    try {
      const res = await getMahasiswaNotifications();
      setNotifications(
        Array.isArray(res.notifications) ? res.notifications : []
      );
    } catch (err) {
      console.error("Gagal mengambil notifikasi mahasiswa:", err);
    }
  }

  async function handleMarkRead(notifId) {
    try {
      await markMahasiswaNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Gagal menandai notifikasi:", err);
    }
  }

  async function handleRespond(sessionId, action) {
    try {
      const res = await respondSession(sessionId, action);

      setMessage({
        type: "success",
        text: res.message,
      });

      await fetchMySessions();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan",
      });
    }
  }

  async function fetchSessionNotes(sessionId) {
    try {
      const res = await getMahasiswaSessionNotes(sessionId);
      setNotesBySession((prev) => ({
        ...prev,
        [sessionId]: res.notes || [],
      }));
    } catch (err) {
      console.error("Gagal mengambil catatan sesi:", err);
    }
  }

  function renderStatusLabel(status) {
    const map = {
      requested: "Menunggu Persetujuan Psikolog",
      accepted: "Menunggu Konfirmasi Anda",
      scheduled: "Menunggu Konfirmasi Anda",
      confirmed: "Terkonfirmasi",
      rejected: "Ditolak",
      completed: "Selesai",
    };

    return map[status] || status;
  }

  return (
    <MahasiswaLayout>
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", color: "#180b0b" }}>
        <h2>Status Tindak Lanjut Konseling</h2>
        <p>
          Halaman ini menampilkan status permohonan konseling Anda. Anda dapat melihat apakah permohonan sudah dikonfirmasi, ditolak, atau masih menunggu.
        </p>
        {notifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4>Notifikasi Tindak Lanjut</h4>
            <div style={{
              maxHeight: 300, // batasi tinggi dropdown
              overflowY: "auto", // scroll otomatis jika banyak
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: 8,
              backgroundColor: "#f1f5f9", // ganti agar beda dari background utama
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) handleMarkRead(n.id);
                      alert(`Notifikasi:\n\n${n.message}`); // pop-up sederhana
                    }}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      cursor: n.is_read ? "default" : "pointer",
                      background: n.is_read ? "#afc1d4" : "#c9ebfe",
                      transition: "background 0.2s",
                      borderLeft: "4px solid #0284c7",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {(
                        {
                          schedule_proposed: "Pengajuan Jadwal Konseling",
                          booking_request: "Permintaan Konseling",
                          session_rejected_by_mahasiswa: "Penolakan Jadwal Konseling",
                          follow_up: "Tindak Lanjut Sistem"
                        }[n.type] || n.type
                      )}
                    </div>

                    <div style={{ marginTop: 4 }}>
                      {n.message}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      <div><b>Psikolog:</b> {n.psychologist_full_name}</div>
                      <div><b>Tanggal Sesi:</b> {n.session_date}</div>
                      <div><b>Waktu Sesi:</b> {n.session_time}</div>
                      <div><b>Status Sesi:</b> {renderStatusLabel(n.session_status)}</div>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
                      <div>
                        Waktu: {n.created_at}
                      </div>
                      <div>
                        Status: {n.is_read ? "Sudah dibaca" : "Belum dibaca"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {loading && <p>Memuat data sesi...</p>}

        {message && (
          <div
            style={{
              background: message.type === "error" ? "#fff1f0" : "#f6ffed",
              color: message.type === "error" ? "#f5222d" : "#52c41a",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {message.text}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <p style={{ fontStyle: "italic", color: "#727e96" }}>
            Anda belum mengajukan permohonan konseling.
          </p>
        )}

        {!loading && sessions.length > 0 && (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "8px" }}>Tanggal sesi konseling</th>
                  <th style={{ padding: "8px" }}>Waktu sesi konseling</th>
                  <th style={{ padding: "8px" }}>Psikolog</th>
                  <th style={{ padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.session_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px" }}>{s.date}</td>
                    <td style={{ padding: "8px" }}>{s.time}</td>
                    <td style={{ padding: "8px" }}>{s.psychologist_name}</td>
                    <td style={{ padding: "8px" }}>
                      {renderStatusLabel(s.status)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {(s.status === "accepted" || s.status === "scheduled") && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleRespond(s.session_id, "accept")}
                            style={{
                              background: "#52c41a",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            Setujui
                          </button>

                          <button
                            onClick={() => handleRespond(s.session_id, "reject")}
                            style={{
                              background: "#f5222d",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sessionNotes.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3>Catatan Psikolog</h3>
                {sessionNotes.map((item, index) => (
                  <div key={index} style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}></div>
                    {item.notes.map((n, idx) => (
                      <div key={idx} style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                        <div><strong>Nama Psikolog:</strong> {n.psychologist_name}</div>
                        <div><strong>Status:</strong> {renderStatusLabel(n.status)}</div>
                        <div><strong>Tanggal Catatan Dibuat:</strong> {n.created_at}</div>
                        <div><strong>Catatan:</strong> {n.notes}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MahasiswaLayout>
  );
}



