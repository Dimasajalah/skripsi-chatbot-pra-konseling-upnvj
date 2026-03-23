//frontend/chatbot/src/pages/PsikologSchedule.jsx
import React, { useEffect, useState } from "react";
import { schedulePsikologSession, getPsikologAvailableTimes, getPsikologSessions, getPsikologSessionNotes, addPsikologSessionNote, acceptCounselingSession, rejectCounselingSession } from "../api";
import PsikologLayout from "../layouts/PsikologLayout";

export default function PsikologSchedule() {

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionData, setSelectedSessionData] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [notesHistory, setNotesHistory] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  // 🔹 Fetch sessions jika belum pilih session
  useEffect(() => {
    fetchSessions();
    fetchAvailableTimes();
  }, []);

  // 🔹 Ambil semua session milik psikolog
  const fetchSessions = async () => {
    try {
      const data = await getPsikologSessions();
      const sessionList = data.sessions || [];
      setSessions(sessionList);

      if (selectedSession) {
        const found = sessionList.find(
          (s) => s.session_id === selectedSession
        );
        setSelectedSessionData(found || null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 Ambil jadwal tersedia psikolog
  const fetchAvailableTimes = async () => {
    try {
      const data = await getPsikologAvailableTimes();
      setAvailableTimes(data.times || []);
      setSelectedTime(data.times?.[0]?.time || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return setError("Pilih session terlebih dahulu");

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await schedulePsikologSession(selectedSession, {
        schedule_id: selectedSessionData?.schedule_id || null,
      });

      setMessage("Jadwal berhasil dikirim dan mahasiswa telah diberitahu.");
      setSelectedSession(null);
      setSelectedTime("");
      fetchSessions();
    } catch (err) {
      setError(err.message || "Gagal mengirim jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedSession) return setError("Pilih session terlebih dahulu");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await addPsikologSessionNote(selectedSession, noteText, noteStatus);

      // Append manual ke state notesHistory agar langsung tampil
      setNotesHistory(prev => [
        ...prev,
        {
          notes: noteText,
          psychologist_name: "psikolog1", // atau ambil dari user login
          created_at: new Date().toISOString(),
          status: noteStatus
        }
      ]);

      setMessage("Catatan berhasil ditambahkan");
      setNoteText("");
      setNoteStatus("");
      fetchSessions();
    } catch (err) {
      setError(err.message || "Gagal menambahkan catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PsikologLayout>
      <div style={styles.container}>
        <h2 style={styles.title}>Siapkan Jadwal Konseling</h2>

        {(
          <>
            <h4>Pilih Session:</h4>
            {sessions.length === 0 && <p>Tidak ada session.</p>}
            {sessions.map((s) => (
              <div key={s.session_id} style={styles.sessionCard}>
                <p><strong>Mahasiswa:</strong> {s.mahasiswa_name || "Belum ada"}</p>
                <p><strong>Tanggal:</strong> {s.date || "-"}</p>
                <p><strong>Jam:</strong> {s.time || "-"}</p>
                <p><strong>Status:</strong> {s.status || "Belum dijadwalkan"}</p>

                {/* 🔹 Tombol Pilih Session */}
                <button
                  style={styles.smallButton}
                  onClick={async () => {
                    setSelectedSession(s.session_id);
                    setNotesHistory([]);
                    setSelectedSessionData(s);
                    setLoading(true);
                    try {
                      const res = await getPsikologSessionNotes(s.session_id);
                      setNotesHistory(res.notes || []);
                    } catch (err) {
                      setError(err.message || "Gagal mengambil catatan");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Pilih Session
                </button>

                {/*Tombol Tolak */}
                <button
                  style={{ ...styles.smallButton, background: "#ef4444" }}
                  onClick={async () => {
                    const reason = prompt("Alasan penolakan (opsional):", "");
                    setLoading(true);
                    try {
                      await rejectCounselingSession(s.session_id, reason);
                      setMessage("Permintaan konseling ditolak");
                      fetchSessions(); // update list session
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Tolak
                </button>

              </div>
            ))}
            <hr style={{ margin: "20px 0" }} />

            <h4>Tambah Catatan</h4>

            <form onSubmit={handleAddNote} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Catatan</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Status</label>
                <select
                  value={noteStatus}
                  onChange={(e) => setNoteStatus(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Pilih Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Menyimpan..." : "Tambah Catatan"}
              </button>
            </form>
            {notesHistory.length > 0 && (
              <>
                <h4>Riwayat Catatan</h4>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}> {/* 🔹 scroll */}
                  {notesHistory.map((n, idx) => (
                    <div key={idx} style={styles.sessionCard}>
                      <p><strong>Psikolog:</strong> {n.psychologist_name}</p>
                      <p><strong>Status:</strong> {n.status}</p>
                      <p><strong>Dibuat:</strong> {new Date(n.created_at).toLocaleString()}</p>
                      <p><strong>Catatan:</strong> {n.notes}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

          </>
        )}

        {selectedSession && (
          <>
            <p style={{ color: "#111827" }}>
              <strong>Mahasiswa:</strong> {selectedSessionData?.mahasiswa_name || "-"}
            </p>

            <p style={{ color: "#111827" }}>
              <strong>Status:</strong> {selectedSessionData?.status || "-"}
            </p>

            <p style={{ color: "#111827" }}>
              <strong>Waktu Sesi Konseling Mahasiswa:</strong> {selectedSessionData?.date} | {selectedSessionData?.time}
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Menyimpan..." : "Kirim Jadwal"}
              </button>

              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setSelectedSession(null)}
              >
                Ganti Session
              </button>
            </form>
          </>
        )}

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </PsikologLayout>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    background: "#ffffff",
    color: "#000",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  title: { marginBottom: "20px", color: "#1f2937" },
  sessionCard: {
    border: "1px solid #ddd",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  smallButton: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#0284c7",
    color: "#000",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "15px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px", color: "#1f2937" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#0284c7",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#6b7280",
    color: "white",
    cursor: "pointer",
  },
  success: { marginTop: "16px", color: "green" },
  error: { marginTop: "16px", color: "red" },
};