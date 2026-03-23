// frontend/chatbot/src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { listSessions, WS_URL, scheduleCounseling } from "../api";

export default function AdminDashboard() {
  const [token] = useState(localStorage.getItem("token") || "");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [filterIntent, setFilterIntent] = useState("");

  // === FORM JADWAL KONSELING ===
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  // Ambil daftar mahasiswa/sesi
  useEffect(() => {
    if (!token) return;
    listSessions(token)
      .then((data) => setSessions(data))
      .catch((err) => console.error(err));
  }, [token]);

  // Connect WebSocket ketika sesi dipilih
  useEffect(() => {
    if (!selectedSession) return;

    wsRef.current?.close();

    const ws = new WebSocket(`${WS_URL}${selectedSession.session_id}?token=${token}`);
    ws.onopen = () => console.log("WS connected for session", selectedSession.session_id);
    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      setChatHistory((prev) => [...prev, data]);
    };
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (err) => console.error("WS error", err);

    wsRef.current = ws;
    return () => ws.close();
  }, [selectedSession, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const filteredChats = filterIntent
    ? chatHistory.filter((m) => m.intent === filterIntent)
    : chatHistory;

  return (
    <div className="dashboard">
      <h1>Dashboard Admin / Psikolog</h1>

      {/* === FORM BUAT JADWAL KONSELING === */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px"
        }}
      >
        <h2>Buat Jadwal Konseling</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <button
          style={{ marginLeft: "10px" }}
          onClick={() => {
            if (!date || !time) {
              alert("Tanggal dan waktu wajib diisi");
              return;
            }

            scheduleCounseling(selectedSession.session_id, { date, time })
              .then(() => {
                alert("Jadwal berhasil dibuat");
                setDate("");
                setTime("");
              })
              .catch(() => alert("Gagal membuat jadwal"));
          }}
        >
          Simpan Jadwal
        </button>

      </div>

      {/* === LAYOUT SIDEBAR + CHAT === */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Sidebar sesi */}
        <div style={{ width: "250px", borderRight: "1px solid #ccc", paddingRight: "10px" }}>
          <h2>Daftar Mahasiswa</h2>
          <ul>
            {sessions.map((s) => (
              <li
                key={s.user_id}
                style={{
                  cursor: "pointer",
                  margin: "5px 0",
                  fontWeight: selectedSession?.session_id === s.session_id ? "bold" : "normal"
                }}
                onClick={() => {
                  setSelectedSession(s);
                  setChatHistory([]);
                }}
              >
                {s.name} ({s.user_id})
              </li>
            ))}
          </ul>
        </div>

        {/* Konten riwayat percakapan */}
        <div style={{ flex: 1, maxHeight: "600px", overflowY: "auto" }}>
          {selectedSession ? (
            <>
              <h2>Riwayat Percakapan: {selectedSession.name}</h2>

              <div style={{ marginBottom: "10px" }}>
                <label>Filter Intent: </label>
                <select value={filterIntent} onChange={(e) => setFilterIntent(e.target.value)}>
                  <option value="">Semua</option>
                  <option value="curhat">Curhat</option>
                  <option value="saran">Meminta Saran</option>
                  <option value="info">Mencari Informasi</option>
                </select>
              </div>

              <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "10px" }}>
                {filteredChats.length === 0 && <p>Belum ada percakapan.</p>}
                {filteredChats.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "10px" }}>
                    <div>
                      <strong>{msg.from === "user" ? selectedSession.name : "Chatbot"}</strong>
                      <small> {new Date(msg.timestamp).toLocaleString()}</small>
                    </div>
                    <div
                      style={{
                        background: msg.from === "user" ? "#d1e7dd" : "#f8d7da",
                        padding: "8px",
                        borderRadius: "5px"
                      }}
                    >
                      {msg.from === "user" ? msg.text : msg.chatbot_text}
                    </div>
                    {msg.from === "bot" && (
                      <div style={{ fontSize: "12px", color: "#555" }}>
                        Emosi: {msg.emotion} ({(msg.emotion_confidence * 100).toFixed(0)}%) • Intent: {msg.intent}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef}></div>
              </div>
            </>
          ) : (
            <p>Pilih mahasiswa dari daftar untuk melihat riwayat percakapan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
