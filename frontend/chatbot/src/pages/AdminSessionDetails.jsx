// frontend/chatbot/src/pages/AdminSessionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getEmotionResultBySession,
  getAdminSessionNotes,
  addAdminSessionNote,
} from "../api";
import AdminLayout from "../layouts/AdminLayout";
import { Bar } from "react-chartjs-2";

export default function AdminSessionDetail() {
  const { sessionId } = useParams();
  const [emotionStats, setEmotionStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      try {
        const emotion = await getEmotionResultBySession(sessionId);
        const notesRes = await getAdminSessionNotes(sessionId);
        setEmotionStats(emotion);
        setNotes(notesRes.notes || []);
      } catch (err) {
        console.error("Gagal load detail session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;

    try {
      setSaving(true);
      const res = await addAdminSessionNote(sessionId, noteInput);
      setNotes((prev) => [...prev, res.note]);
      setNoteInput("");
    } catch (err) {
      console.error("Gagal tambah note:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading detail session...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.page}>
        {/* ===== HEADER ===== */}
        <div style={styles.header}>
          <h2>Detail Session</h2>
          <span style={styles.sessionId}>Session ID: {sessionId}</span>
        </div>

        {/* ===== TOP GRID ===== */}
        <div style={styles.topGrid}>
          {/* INFO SESSION */}
          <div style={styles.card}>
            <h3>Informasi Session</h3>
            <p><b>Session ID:</b> {sessionId}</p>
            <p><b>Total Data Emosi:</b> {emotionStats?.total_data || 0}</p>
          </div>

          {/* EMOTION CHART */}
          <div style={styles.card}>
            <h3>Distribusi Emosi</h3>
            {emotionStats &&
            Object.keys(emotionStats.emotion_distribution || {}).length > 0 ? (
              <Bar
                data={{
                  labels: Object.keys(emotionStats.emotion_distribution),
                  datasets: [
                    {
                      label: "Jumlah",
                      data: Object.values(emotionStats.emotion_distribution),
                      backgroundColor: "#3b82f6",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            ) : (
              <p style={styles.muted}>Tidak ada data emosi</p>
            )}
          </div>
        </div>

        {/* ===== ADMIN NOTES ===== */}
        <div style={styles.card}>
          <h3>Catatan Admin</h3>

          {notes.length > 0 ? (
            <div style={styles.noteList}>
              {notes.map((n) => (
                <div key={n.note_id} style={styles.noteItem}>
                  <div style={styles.noteHeader}>
                    <b>{n.admin_name}</b>
                    <small>{new Date(n.created_at).toLocaleString()}</small>
                  </div>
                  <p>{n.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>Belum ada catatan</p>
          )}

          <div style={styles.noteInputWrapper}>
            <textarea
              placeholder="Tulis catatan admin..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              style={styles.textarea}
            />
            <button
              onClick={handleAddNote}
              style={styles.btn}
              disabled={savingNote || !newNote.trim()}
            >
              {saving ? "Menyimpan..." : "Simpan Catatan"}
            </button>
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
    gap: "24px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sessionId: {
    color: "#6b7280",
    fontSize: "14px",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  muted: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  noteList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
  noteItem: {
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "14px",
  },
  noteInputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  btn: {
    alignSelf: "flex-end",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
};
