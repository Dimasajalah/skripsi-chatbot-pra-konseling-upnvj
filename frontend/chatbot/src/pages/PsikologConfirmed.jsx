// frontend/chatbot/src/pages/PsikologConfirmed.jsx
import React, { useEffect, useState } from "react";
import { getConfirmedSessionsAll } from "../api";
import PsikologLayout from "../layouts/PsikologLayout";

export default function PsikologConfirmed() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getConfirmedSessionsAll();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading)
    return (
      <PsikologLayout>
        <p>Loading...</p>
      </PsikologLayout>
    );

  if (error)
    return (
      <PsikologLayout>
        <p style={{ color: "red" }}>{error}</p>
      </PsikologLayout>
    );

  function renderStatusLabel(status) {
    const map = {
      requested: "Menunggu",
      accepted: "Disetujui",
      scheduled: "Terjadwal",
      confirmed: "Dikonfirmasi",
      rejected: "Ditolak",
      completed: "Selesai",
      ongoing: "Berlangsung",
    };

    return map[status] || "-";
  }

  return (
    <PsikologLayout>
      <h2 style={{ marginBottom: "16px", color: "#0c4a6e" }}>
        Daftar Sesi Terkonfirmasi Mahasiswa
      </h2>
      {sessions.length === 0 ? (
        <p>Tidak ada sesi yang sudah dikonfirmasi mahasiswa.</p>
      ) : (
        <div style={styles.container}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th>Mahasiswa</th>
                <th>Tanggal Jadwal</th>
                <th>Status</th>
                <th>Tanggal Dibuat</th>
                <th>Notes History</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, idx) => (
                <tr
                  key={s._id}
                  style={{
                    background: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                    color: "#1f2937",
                  }}
                >
                  <td>{s.mahasiswa_name || "-"}</td>
                  <td>{s.date || "-"} | {s.time || "-"}</td>
                  <td>{s.status || "-"}</td>
                  <td>{s.scheduled_at || "-"}</td>
                  <td style={styles.scrollCell}>
                    {s.notes_history && s.notes_history.length > 0 ? (
                      <ul style={styles.list}>
                        {s.notes_history.map((n, i) => (
                          <li key={i}>
                            <strong>[{renderStatusLabel(n.status)}] {n.psychologist_name || "-"}:</strong> {n.notes} <br />
                            <em>({n.created_at || "-"})</em>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PsikologLayout>
  );
}

const styles = {
  container: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "70vh",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f3f4f6",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
    color: "#1f2937",
  },
  headerRow: {
    background: "#0ea5e9",
    color: "#ffffff",
    textAlign: "left",
  },
  scrollCell: {
    maxHeight: "150px",
    overflowY: "auto",
    padding: "4px",
    verticalAlign: "top",
  },
  list: {
    paddingLeft: "16px",
    margin: 0,
    color: "#1f2937",
  },
};
