// frontend/chatbot/src/pages/ArchivedEmotionsPsikologPage.jsx
import React, { useEffect, useState } from "react";
import { getAllArchivedEmotionsPsikolog } from "../api";
import PsikologLayout from "../layouts/PsikologLayout";

export default function ArchivedEmotionsPsikologPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
        async function fetchSessions() {
            setLoading(true);
            try {
                const data = await getAllArchivedEmotionsPsikolog();
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

    const headers = [
        // USER
        "full_name",
        "username",
        "email",
        "angkatan",

        // SESSION
        "created_at",
        "ended_at",
        "duration_seconds",
        "is_active",
        "critical_detected",
        "session_last_emotion",
        "emotion_distribution",
        "emotion_percentages",

        // FINAL ANALYSIS
        "risk_level",
        "percentage_negative",
        "percentage_positive",
        "percentage_neutral",
        "max_consecutive_negative",
        "average_negative_streak",
        "final_last_emotion",
        "final_created_at",

        // META
        "total_logs",

        // EMOTION LOGS (ringkas)
        "emotion_logs"
    ];

    const headerLabels = {
        full_name: "Nama",
        username: "Username",
        email: "Email",
        angkatan: "Angkatan",

        created_at: "Mulai",
        ended_at: "Selesai",
        duration_seconds: "Durasi",
        is_active: "Aktif",
        critical_detected: "Kritis",
        session_last_emotion: "Emosi Akhir (Session)",
        emotion_distribution: "Distribusi Emosi",
        emotion_percentages: "Persentase Emosi",

        risk_level: "Risk Level",
        percentage_negative: "Negatif (%)",
        percentage_positive: "Positif (%)",
        percentage_neutral: "Netral (%)",
        max_consecutive_negative: "Max Negatif",
        average_negative_streak: "Rata-rata Negatif",
        final_last_emotion: "Emosi Akhir (Final)",
        final_created_at: "Waktu Analisis",

        total_logs: "Total Log",
        emotion_logs: "Detail Emosi"
    };

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

    const renderCell = (value, field) => {
        if (field === "is_active" || field === "critical_detected") {
            return value ? "Ya" : "Tidak";
        }

        if (["created_at", "ended_at", "final_created_at"].includes(field)) {
            return value ? value : "-";
        }

        if (field === "duration_seconds") {
            return value ? `${Math.round(value)} detik` : "-";
        }
        if (field === "critical_detected") {
            return (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                    {value ? "Kritis" : "Normal"}
                </span>
            );
        }
        if (field === "risk_level") {
            const color =
                value === "Tinggi" ? "bg-red-100 text-red-700" :
                    value === "Waspada" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700";

            return (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
                    {value}
                </span>
            );
        }
        if (field === "emotion_distribution" && typeof value === "object") {
            return (
                <div className="flex flex-wrap gap-1">
                    {Object.entries(value).map(([k, v]) => (
                        k !== "total" && (
                            <span key={k} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {k}: {v}
                            </span>
                        )
                    ))}
                </div>
            );
        }
        if (field === "emotion_percentages" && typeof value === "object") {
            return (
                <div className="flex flex-wrap gap-1">
                    {Object.entries(value).map(([k, v]) => (
                        <span key={k} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            {k.replace("_pct", "")}: {v}%
                        </span>
                    ))}
                </div>
            );
        }
        if (field === "emotion_logs" && Array.isArray(value)) {
            return (
                <div className="space-y-1 max-w-xs">
                    {value.slice(0, 3).map((log, i) => (
                        <div key={i} className="text-xs bg-gray-100 p-1 rounded">
                            <span className="font-semibold">{log.emotion}</span>: {log.text}
                        </div>
                    ))}
                    {value.length > 3 && (
                        <button
                            className="text-blue-500 text-xs"
                            onClick={() => toggleExpand(idx, field)}
                        >
                            Lihat lebih banyak
                        </button>
                    )}
                </div>
            );
        }

        return value || "-";
    };

    const formattedSessions = sessions.map((item) => ({
        // USER
        full_name: item.user?.full_name,
        username: item.user?.username,
        email: item.user?.email,
        angkatan: item.user?.angkatan,

        // SESSION
        created_at: item.session?.created_at,
        ended_at: item.session?.ended_at,
        duration_seconds: item.session?.duration_seconds,
        is_active: item.session?.is_active,
        critical_detected: item.session?.critical_detected,
        session_last_emotion: item.session?.last_emotion,
        emotion_distribution: item.session?.emotion_distribution,
        emotion_percentages: item.session?.emotion_percentages,

        // FINAL ANALYSIS
        risk_level: item.final_analysis?.risk_level,
        percentage_negative: item.final_analysis?.percentage_negative,
        percentage_positive: item.final_analysis?.percentage_positive,
        percentage_neutral: item.final_analysis?.percentage_neutral,
        max_consecutive_negative: item.final_analysis?.max_consecutive_negative,
        average_negative_streak: item.final_analysis?.average_negative_streak,
        final_last_emotion: item.final_analysis?.last_emotion,
        final_created_at: item.final_analysis?.created_at,

        // META
        total_logs: item.meta?.total_logs,

        // EMOTION LOGS (ringkas biar ga berantakan)
        emotion_logs: item.emotion_logs
            ?.map(log => `${log.emotion} (${log.text})`)
            .join(" | ")
    }));

    return (
        <PsikologLayout>
            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-2 text-black">
                    Riwayat Emosi Mahasiswa
                </h2>
                <p className="text-gray-500 mb-4">
                    Semua sesi mahasiswa yang sudah selesai
                </p>

                {loading ? (
                    <p className="text-gray-500 mb-4">Memuat data sesi...</p>
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
                                            {headerLabels[h] || h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {formattedSessions.map((s, idx) => (
                                    <tr
                                        key={idx}
                                        className={`hover:bg-gray-50 ${s.critical_detected ? "bg-red-50" : ""}`}
                                    >
                                        {headers.map((field) => (
                                            <td
                                                key={field}
                                                className="px-3 py-2 text-sm text-gray-900 align-top"
                                            >
                                                {renderCell(s[field], field)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PsikologLayout>
    );
}