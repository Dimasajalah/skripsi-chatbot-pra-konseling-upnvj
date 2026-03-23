// src/pages/AdminCounselingRequests.jsx
import React, { useEffect, useState } from "react";
import { getCounselingRequests } from "../api";
import Modal from "../components/Modal.jsx"; // Modal sederhana
import { FaCalendarAlt, FaTimes, FaCheck } from "react-icons/fa";
import AdminLayout from "../layouts/AdminLayout"; // <-- tambahkan layout admin

export default function AdminCounselingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const tdStyle = {
        padding: "10px 8px",
        fontSize: "14px",
        color: "#1e293b", // <-- pastikan teks terlihat di background putih
    };

    // Fetch requests
    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getCounselingRequests();
            setRequests(data.requests || []);
        } catch (err) {
            setError(err.message || "Gagal mengambil permohonan konseling");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Open schedule modal
    const openScheduleModal = (sessionId) => {
        setCurrentSession(sessionId);
        setDate("");
        setTime("");
        setModalOpen(true);
    };

    return (
        <AdminLayout> {/* <-- bungkus semua konten dengan AdminLayout */}
            <div style={{ padding: 20 }}>
                <h2 style={headerStyle}>Permohonan Konseling Mahasiswa</h2>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && !requests.length && (
                    <p style={{ color: "#1e293b" }}>Tidak ada permohonan konseling.</p>
                )}

                {requests.length > 0 && (
                    <div style={{ overflowX: "auto", marginTop: 20 }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={theadStyle}>

                                    <th style={thStyle}>Mahasiswa</th>

                                    <th style={thStyle}>Tanggal Konseling</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Waktu Konseling</th>
                                    <th style={thStyle}>Diajukan Pada</th>

                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req, i) => (
                                    <tr
                                        key={req.session_id}
                                        style={{
                                            background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e0f2fe")}
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = i % 2 === 0 ? "#ffffff" : "#f9fafb")
                                        }
                                    >
                                        <td style={tdStyle}>{req.mahasiswa_name || "N/A"}</td>
                                        <td style={tdStyle}>{req.date || "N/A"}</td>
                                        <td style={tdStyle}>{req.status || "Pending"}</td>
                                        <td style={tdStyle}>{req.time || "N/A"}</td>
                                        <td style={tdStyle}>
                                            {req.requested_at || "N/A"}
                                        </td>

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

// ====== STYLES ======
const headerStyle = {
    marginBottom: 20,
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
};

const inputStyle = {
    padding: "8px 10px",
    borderRadius: "5px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
};


const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "sans-serif",
};

const theadStyle = {
    background: "#1e293b",
    color: "#fff",
};

const thStyle = {
    padding: "12px 8px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
};

const tdStyle = {
    padding: "10px 8px",
    fontSize: "14px",
};

const btnSchedule = {
    padding: "6px 12px",
    marginRight: "8px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    transition: "all 0.2s",
};

const btnReject = {
    padding: "6px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    transition: "all 0.2s",
};
