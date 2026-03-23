// frontend/chatbot/src/pages/ArchivedEmotionsPage.jsx
import React, { useEffect, useState } from "react";
import { getAllSessionsWithEmotionsAdmin } from "../api";
import AdminLayout from "../layouts/AdminLayout";

export default function ArchivedEmotionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const fieldLabels = {
    is_active: "Status Aktif",
    critical_detected: "Kondisi Kritis",
    created_at: "Waktu Mulai",
    ended_at: "Waktu Selesai",
    full_name: "Nama Mahasiswa",
    email: "Email",
    risk_level: "Level Risiko",
    last_emotion: "Emosi Terakhir",
    total_messages: "Total Pesan",
    percentage_negative: "% Negatif",
    percentage_positive: "% Positif",
    percentage_neutral: "% Netral",
    max_consecutive_negative: "Negatif Berturut",
    average_negative_streak: "Rata-rata Negatif",
    streak_ge2_count: "Streak ≥2",
    high_risk_keyword_count: "Keyword Risiko Tinggi",
    medium_risk_keyword_count: "Keyword Risiko Sedang",
    emotion_distribution: "Distribusi Emosi",
    emotion_percentages: "Persentase Emosi",
    emotion_history: "Riwayat Emosi",
  };

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const data = await getAllSessionsWithEmotionsAdmin();
        setSessions(data.sessions || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Ambil semua field kecuali _id dan user_id
  const headers = sessions.length
    ? Object.keys(sessions[0]).filter(
      (h) =>
        !["_id", "user_id", "session_id", "last_emotion_result_id", "last_recommendation_id"].includes(h)
    )
    : [];

  const toggleExpand = (rowIdx, field) => {
    const key = `${rowIdx}-${field}`;
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatJSON = (value) => {
    if (Array.isArray(value)) {
      return value.map((v, idx) => (
        <div key={idx} className="mb-1">
          {Object.entries(v).map(([k, val]) => (
            <div key={k} className="flex space-x-2">
              <span className="font-semibold text-gray-700">{k}:</span>
              <span>{val?.toString()}</span>
            </div>
          ))}
        </div>
      ));
    } else if (typeof value === "object" && value !== null) {
      return Object.entries(value).map(([k, val]) => (
        <div key={k} className="flex space-x-2">
          <span className="font-semibold text-gray-700">{k}:</span>
          <span>{val?.toString()}</span>
        </div>
      ));
    }
    return value?.toString() ?? "-";
  };

  const renderCell = (s, field, idx) => {
    const key = `${idx}-${field}`;
    let value = s[field];

    if (field === "is_active" || field === "critical_detected") {
      return value ? "Ya" : "Tidak";
    }
    if (["created_at", "ended_at"].includes(field)) {
      return value || "-"; // sudah WIB dari backend
    }
    if (field === "risk_level") {
      const color =
        value === "Tinggi"
          ? "bg-red-100 text-red-700"
          : value === "Sedang"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700";

      return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
          {value}
        </span>
      );
    }
    if (field.startsWith("percentage_")) {
      return (
        <div className="w-[120px]">
          <div className="text-xs">{value}%</div>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      );
    }
    if (field === "emotion_history" && Array.isArray(value)) {
      const isExpanded = expandedRows[key];

      return (
        <div>
          <button
            className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100"
            onClick={() => toggleExpand(idx, field)}
          >
            {isExpanded ? "Sembunyikan" : `Lihat (${value.length})`}
          </button>

          {isExpanded && (
            <div className="mt-2 bg-gray-50 p-3 rounded border max-w-[400px] space-y-2">
              {value.map((item, i) => (
                <div key={i} className="border-b pb-1 text-xs">
                  <div><b>Emosi:</b> {item.label}</div>
                  <div><b>Teks:</b> {item.text}</div>
                  <div><b>Confidence:</b> {item.confidence}</div>
                  <div className="text-gray-500">{item.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (["emotion_distribution", "emotion_percentages"].includes(field)) {
      if (!value) return "-";

      const isExpanded = expandedRows[key];

      return (
        <div>
          <button
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200"
            onClick={() => toggleExpand(idx, field)}
          >
            {isExpanded ? "Tutup" : "Lihat Detail"}
          </button>

          {isExpanded && (
            <div className="mt-2 bg-gray-50 p-2 rounded border text-xs">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return value ?? "-";
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-2 text-black">Riwayat Emosi Mahasiswa</h2>
        <p className="text-gray-500 mb-4">Semua sesi mahasiswa yang sudah selesai</p>

        {loading ? (
          <p>Memuat data sesi...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500">Tidak ada data sesi.</p>
        ) : (
          <div className="overflow-auto border rounded-lg shadow max-h-[80vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      {fieldLabels[h] || h.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((s, idx) => (
                  <tr key={idx} className={s.critical_detected ? "bg-red-50" : ""}>
                    {headers.map((field) => (
                      <td key={field} className="px-3 py-2 text-sm text-gray-900 align-top">
                        {renderCell(s, field, idx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}