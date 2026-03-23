// frontend/chatbot/src/pages/HasilAsesmen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MahasiswaLayout from "../layouts/MahasiswaLayout";
import { getMyEmotionResults, getLatestAssessment, getPsikologRecommendationBySession, getMyAssessmentHistory } from "../api";

const emotionColor = {
  senang: "#52c41a",
  sedih: "#1890ff",
  marah: "#f5222d",
  cemas: "#faad14",
  netral: "#8c8c8c",
  lainnya: "#bfbfbf",
};

export default function HasilAsesmen() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessment();
  }, []);

  async function fetchAssessment() {
    try {
      const [historyRes, emotionRes, latestAssessment] = await Promise.all([
        getMyAssessmentHistory(),
        getMyEmotionResults(),
        getLatestAssessment(),
      ]);

      // riwayat asesmen
      setResults(emotionRes || historyRes || []);

      // asesmen terbaru
      setLatest(latestAssessment || null);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!latest?.session_id) return;

    async function fetchPsikologRec() {
      try {
        const psikologRec = await getPsikologRecommendationBySession(
          latest.session_id
        );

        setLatest(prev => ({
          ...prev,
          psikolog_recommendation: psikologRec.text,
          psikolog_recommendation_id: psikologRec.recommendation_id,
          psikolog_created_at: psikologRec.created_at,
        }));
      } catch (err) {
        console.error("Gagal ambil rekomendasi psikolog:", err);
      }
    }

    fetchPsikologRec();
  }, [latest?.session_id]);

  const needsFollowUp = latest?.critical_detected === true;

  return (
    <MahasiswaLayout>
      <div style={{
        padding: "24px 16px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        color: "#180b0b"
      }}>
        <h2>Hasil Asesmen Emosi</h2>

        <p style={{ color: "#180b0b", marginBottom: 24 }}>
          Halaman ini menampilkan hasil analisis emosi berdasarkan interaksi Anda
          dengan sistem chatbot. Informasi ini bersifat informatif dan dapat
          membantu Anda memahami kondisi emosional secara umum.
        </p>

        {/* LOADING */}
        {loading && (
          <div className="animate-pulse bg-gray-100 rounded-lg h-32 w-full mb-6"></div>
        )}

        {/* EMPTY STATE */}
        {!loading && !latest && results.length === 0 && (
          <p style={{ color: "#727e96", fontStyle: "italic" }}>
            Anda belum memiliki hasil asesmen. Silakan mulai sesi percakapan terlebih dahulu.
          </p>
        )}

        {latest && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              borderLeft: `8px solid ${needsFollowUp ? "#f5222d" : "#52c41a"}`,
            }}
          >
            {/* Hasil Asesmen Terbaru */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-all duration-200 border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Hasil Asesmen Terbaru</h3>
                <span className="text-sm text-gray-500">
                  {latest.emotion_created_at && new Date(latest.emotion_created_at).toLocaleString()}
                </span>
              </div>

              {/* Grid Field Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(latest).map(([key, value]) => {
                  const hiddenFields = [
                    "_id",
                    "session_id",
                    "emotion_id",
                    "user_id",
                    "session_created_at",
                    "session_ended_at",
                    "session_is_active",
                    "source",
                  ];

                  if (hiddenFields.includes(key)) return null;

                  // Label Bahasa Indonesia
                  const labels = {
                    label_emosi: "Emosi Dominan",
                    last_emotion: "Emosi Terakhir",
                    risk_level: "Tingkat Risiko",
                    percentage_negative: "Persentase Negatif",
                    percentage_positive: "Persentase Positif",
                    percentage_neutral: "Persentase Netral",
                    total_messages: "Total Pesan",
                    max_consecutive_negative: "Negatif Berturut-turut Maks",
                    average_negative_streak: "Rata-rata Negatif Berturut",
                    streak_ge2_count: "Jumlah Streak ≥2",
                    high_risk_keyword_count: "Keyword Risiko Tinggi",
                    medium_risk_keyword_count: "Keyword Risiko Sedang",
                    emotion_distribution: "Distribusi Emosi",
                    emotion_percentages: "Persentase Emosi",
                    critical_detected: "Terdeteksi Kritis",
                    full_name: "Dibuat oleh",
                    created_by_role: "Peran Pembuat",
                    source: "Sumber",
                    follow_up_message: "Pesan Lanjutan",
                    follow_up_reason: "Alasan Lanjutan",
                    emotion_created_at: "Tanggal Sesi Dibuat",
                  };

                  // Render distribusi dan persentase dengan visualisasi
                  if (key === "emotion_distribution") {
                    return (
                      <div key={key} className="mb-4">
                        <span className="font-medium text-gray-700">{labels[key]}</span>
                        <div className="flex gap-2 mt-2">
                          {Object.entries(value)
                            .filter(([k]) => k !== "total")
                            .map(([label, count]) => (
                              <div
                                key={label}
                                className="flex-1 rounded text-white text-xs text-center py-1"
                                style={{
                                  backgroundColor: emotionColor[label] || "#bfbfbf",
                                  flex: Math.max(count, 1),
                                  minWidth: 40
                                }}
                              >
                                {label} ({count})
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  }

                  if (key === "emotion_percentages") {
                    return (
                      <div key={key} className="mb-4">
                        <span className="font-medium text-gray-700">{labels[key]}</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                          {Object.entries(value).map(([label, pct]) => (
                            <div key={label} className="bg-gray-50 p-2 rounded text-center">
                              <div className="text-gray-500 text-sm">{label.replace("_pct", "")}</div>
                              <div className="font-semibold text-gray-800">{pct}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Boolean untuk Kritis
                  if (key === "critical_detected") {
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-700">{labels[key]}</span>
                        <span className={value ? "text-red-500" : "text-green-600"}>
                          {value ? "Ya" : "Tidak"}
                        </span>
                      </div>
                    );
                  }

                  // Default render untuk semua field lain
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-700">{labels[key] || key}</span>
                      <span className="text-gray-800">{typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REKOMENDASI */}
            {latest.recommendation && (
              <div style={{ marginTop: 16, background: "#fffbe6", padding: 12, borderRadius: 8 }}>
                <strong>Rekomendasi:</strong>
                <p style={{ marginTop: 4 }}>{latest.recommendation || "Sesi selesai, tidak ada rekomendasi khusus."}</p>
              </div>
            )}
            {latest.psikolog_recommendation && (
              <div style={{ marginTop: 16, background: "#e6f7ff", padding: 12, borderRadius: 8 }}>
                <strong>Rekomendasi Psikolog:</strong>
                <p style={{ marginTop: 4 }}>{latest.psikolog_recommendation}</p>
                <p style={{ fontSize: 12, color: "#555" }}>
                  Urgensi: {latest.psikolog_urgency}, Diterbitkan: {new Date(latest.psikolog_created_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* FOLLOW UP */}
            {needsFollowUp && (
              <div style={{ marginTop: 16, background: needsFollowUp ? "#fff1f0" : "#f6ffed", padding: 12, borderRadius: 8 }}>
                <strong>{needsFollowUp ? "Saran Lanjutan:" : "Informasi:"}</strong>
                <p>{latest.follow_up_message}</p>
                <p style={{ fontSize: 12, color: "#555" }}>{latest.follow_up_reason}</p>
                {needsFollowUp && (
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button onClick={() => navigate("/booking-konseling")} style={btnPrimary}>Ajukan Konseling</button>
                    <button onClick={() => navigate("/chat")} style={btnSecondary}>Nanti Saja</button>
                  </div>
                )}
              </div>
            )}

            {!needsFollowUp && (
              <p style={{ marginTop: 16, color: "#389e0d" }}>
                Kondisi emosional Anda masih dalam batas wajar.
              </p>
            )}
          </div>
        )}

        {/* RIWAYAT ASESMEN */}
        {results.length > 0 && (
          <>
            <h3 style={{ marginBottom: 12 }}>Riwayat Asesmen</h3>

            <div
              style={{
                maxHeight: "60vh",        // tinggi maksimum container
                overflowY: "auto",     // scroll vertikal jika lebih tinggi
                paddingRight: 8,       // ruang agar scrollbar tidak menutupi konten
              }}
            >
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Hasil Asesmen</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(r.emotion_created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Grid Field Utama */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Emosi Dominan:</span>
                      <span className="text-gray-800">{r.label_emosi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Emosi Terakhir:</span>
                      <span className="text-gray-800">{r.last_emotion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Tingkat Risiko:</span>
                      <span className="text-yellow-600 font-semibold">{r.risk_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Sumber:</span>
                      <span className="text-gray-800">{r.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Dibuat oleh:</span>
                      <span className="text-gray-800">{r.full_name} ({r.created_by_role})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Terdeteksi Kritis:</span>
                      <span className={r.critical_detected ? "text-red-500" : "text-green-600"}>
                        {r.critical_detected ? "Ya" : "Tidak"}
                      </span>
                    </div>
                  </div>

                  {/* Persentase */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-gray-500 text-sm">Negatif</div>
                      <div className="font-semibold text-red-600">{r.percentage_negative}%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-gray-500 text-sm">Positif</div>
                      <div className="font-semibold text-green-600">{r.percentage_positive}%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-gray-500 text-sm">Netral</div>
                      <div className="font-semibold text-gray-700">{r.percentage_neutral}%</div>
                    </div>
                  </div>

                  {/* Statistik Lainnya */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Total Pesan</span>
                      <div className="font-semibold text-gray-800">{r.total_messages}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Negatif Berturut-turut Maks</span>
                      <div className="font-semibold text-red-600">{r.max_consecutive_negative}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Rata-rata Negatif Berturut</span>
                      <div className="font-semibold text-red-600">{r.average_negative_streak}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Jumlah Streak ≥2</span>
                      <div className="font-semibold text-red-600">{r.streak_ge2_count}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Keyword Risiko Tinggi</span>
                      <div className="font-semibold text-red-600">{r.high_risk_keyword_count}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <span className="text-gray-500 text-sm">Keyword Risiko Sedang</span>
                      <div className="font-semibold text-orange-500">{r.medium_risk_keyword_count}</div>
                    </div>
                  </div>

                  {/* Distribusi Emosi */}
                  {r.emotion_distribution && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Distribusi Emosi:</span>
                      <div className="flex gap-2 mt-2">
                        {Object.entries(r.emotion_distribution)
                          .filter(([k]) => k !== "total")
                          .map(([label, count]) => (
                            <div
                              key={label}
                              className="flex-1 rounded text-white text-xs text-center py-1"
                              style={{
                                backgroundColor: emotionColor[label] || "#bfbfbf",
                                flex: Math.max(count, 1),
                                minWidth: 40
                              }}
                            >
                              {label} ({count})
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Persentase per emosi */}
                  {r.emotion_percentages && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Persentase Emosi:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                        {Object.entries(r.emotion_percentages).map(([label, pct]) => (
                          <div key={label} className="bg-gray-50 p-2 rounded text-center">
                            <div className="text-gray-500 text-sm">{label.replace("_pct", "")}</div>
                            <div className="font-semibold text-gray-800">{pct}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tanggal sesi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                      <span className="font-medium text-gray-700">Sesi Dibuat:</span>{" "}
                      <span className="text-gray-800">{new Date(r.session_created_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sesi Berakhir:</span>{" "}
                      <span className="text-gray-800">{new Date(r.session_ended_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sesi Aktif:</span>{" "}
                      <span className={r.session_is_active ? "text-red-500" : "text-green-600"}>
                        {r.session_is_active ? "Ya" : "Tidak"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </MahasiswaLayout>
  );
}

const btnPrimary = {
  background: "#f5222d",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  maxWidth: 220
};

const btnSecondary = {
  background: "#e5e7eb",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const alertBox = {
  background: "#fff1f0",
  borderLeft: "6px solid #f5222d",
  padding: 12,
  borderRadius: 8,
  margin: "16px 0",
};

