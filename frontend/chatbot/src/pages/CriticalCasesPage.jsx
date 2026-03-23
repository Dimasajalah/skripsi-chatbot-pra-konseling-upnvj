// frontend/chatbot/src/pages/CriticalCasesPage.jsx
import React, { useEffect, useState } from "react";
import { getCriticalCases } from "../api";
import AdminLayout from "../layouts/AdminLayout";

export default function CriticalCasesPage() {
  const [criticalCases, setCriticalCases] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchCriticalCases = async () => {
      try {
        const data = await getCriticalCases();
        setCriticalCases(data.critical_cases || []);
      } catch (err) {
        console.error("Gagal ambil critical cases:", err);
      }
    };
    fetchCriticalCases();
  }, []);

  const formatDate = (date) => date || "-";

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: "16px", color: "#dc2626" }}>
            Daftar Kasus Kritis
          </h2>

          {criticalCases.length === 0 ? (
            <p>Tidak ada kasus kritis</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mahasiswa</th>
                    <th style={styles.th}>Tanggal Dibuat</th>
                    <th style={styles.th}>Sesi Berakhir</th>
                    <th style={styles.th}>Status Sesi</th>
                    <th style={styles.th}>Kritikal</th>
                    <th style={styles.th}>Emosi Terakhir</th>
                    <th style={styles.th}>Kepercayaan</th>
                    <th style={styles.th}>Rekomendasi</th>
                    <th style={styles.th}>Riwayat Emosi</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalCases.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <tr
                        style={
                          idx % 2 === 0
                            ? styles.rowEven
                            : styles.rowOdd
                        }
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === idx ? null : idx
                          )
                        }
                      >
                        <td style={styles.td}>
                          {row.full_name ? `${row.full_name} (${row.username})` : row.username}
                        </td>

                        <td style={styles.td}>{formatDate(row.created_at)}</td>

                        <td style={styles.td}>{formatDate(row.ended_at)}</td>

                        <td style={styles.td}>
                          {row.is_active ? "Aktif" : "Selesai"}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              color: row.critical_detected ? "#dc2626" : "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            {row.critical_detected ? "YA" : "TIDAK"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {row.last_emotion || "-"}
                        </td>

                        <td style={styles.td}>
                          {row.emotion_confidence
                            ? `${(row.emotion_confidence * 100).toFixed(1)}%`
                            : "-"}
                        </td>

                        <td style={styles.td}>
                          {row.last_recommendation || "-"}
                        </td>
                        <td style={styles.td}>
                          <button
                            style={styles.button}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRow(expandedRow === idx ? null : idx);
                            }}
                          >
                            Lihat Riwayat
                          </button>
                        </td>
                      </tr>

                      {/* DETAIL ROW */}
                      {expandedRow === idx && (
                        <tr>
                          <td colSpan="9" style={styles.detailBox}>
                            <strong>Riwayat Emosi Mahasiswa</strong>
                            <div style={styles.historyBox}>
                              {Array.isArray(row.emotion_history) &&
                                row.emotion_history.length > 0 ? (
                                row.emotion_history.map((e, i) => (
                                  <div key={i} style={styles.historyItem}>
                                    <b>Emosi:</b> {e.label} <br />
                                    <b>Teks:</b> {e.text} <br />
                                    <b>Kepercayaan:</b> {(e.confidence * 100).toFixed(1)}% <br />
                                    <b>Waktu:</b> {formatDate(e.timestamp)}
                                  </div>
                                ))
                              ) : (
                                "-"
                              )}
                            </div>

                            <br />

                            <strong>Last Recommendation:</strong>
                            <div>
                              {row.last_recommendation || "-"}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: {
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    color: "#111827",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px",
    borderBottom: "2px solid #e5e7eb",
    textAlign: "left",
    fontWeight: 600,
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
  },
  rowEven: {
    backgroundColor: "#f9fafb",
  },
  rowOdd: {
    backgroundColor: "#ffffff",
  },
  detailBox: {
    backgroundColor: "#f3f4f6",
    padding: "15px",
  },
  historyBox: {
    marginTop: "8px",
    maxHeight: "200px",
    overflowY: "auto",
    background: "#ffffff",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  historyItem: {
    padding: "4px 0",
    borderBottom: "1px dashed #e5e7eb",
    fontSize: "14px",
  },
  tableWrapper: {
    overflowX: "auto",
    maxHeight: "500px",
    overflowY: "auto"
  },
  button: {
    padding: "6px 10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px"
  },
};
