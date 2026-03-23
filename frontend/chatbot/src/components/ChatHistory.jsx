// src/components/ChatHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import { getSessionBySessionId, getEmotionStatsBySessionId } from "../api";
import EmotionChart from "./EmotionChart";

export default function ChatHistory({ sessionId, token }) {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState([]);
  const bottomRef = useRef(null);

  // ==== Ambil chat history ====
  useEffect(() => {
    if (!sessionId || !token) return;

    getSessionBySessionId(sessionId, token)
      .then((data) => setMessages(data?.messages || []))
      .catch((err) => console.error("Gagal ambil history:", err));
  }, [sessionId, token]);

  // ==== Ambil emotion stats ====
  useEffect(() => {
    if (!sessionId || !token) return;

    async function fetchStats() {
      try {
        const data = await getEmotionStatsBySessionId(sessionId, token);
        setStats(data?.stats || []);
      } catch (err) {
        console.error("Gagal ambil statistik emosi:", err);
      }
    }

    fetchStats();
  }, [sessionId, token]);

  // ==== Auto scroll ke bawah saat ada pesan baru ====
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length]);

  const bubble = (from) => ({
    background: from === "user" ? "#e3f2fd" : "#f1f1f1",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "6px",
    maxWidth: "70%",
    alignSelf: from === "user" ? "flex-start" : "flex-end",
    border: "1px solid #ddd",
  });

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        height: "520px",
        overflowY: "auto",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        background: "#fafafa",
      }}
    >
      {messages.map((m, i) => {
        const rawFrom = (m.from || m.sender || "bot").toString().toLowerCase();
        const from = rawFrom === "user" || rawFrom === "mahasiswa" ? "user" : "bot";
        const text = m.text || m.message || m.response || "-";

        const emotionLabel =
          m.emotion && typeof m.emotion === "object"
            ? m.emotion.label || m.emotion.emotion || "-"
            : typeof m.emotion === "string"
            ? m.emotion
            : "-";
        const emotionConf = m.emotion?.confidence ?? m.emotion_confidence ?? null;

        const intentLabel =
          typeof m.intent === "string"
            ? m.intent
            : m.intent?.label || m.intent?.intent || "-";
        const intentConf = m.intent?.confidence ?? m.intent_confidence ?? null;

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column" }}>
            <div style={bubble(from)}>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {from === "user" ? "Mahasiswa" : "Chatbot"}
              </div>

              <div style={{ marginBottom: "6px" }}>{text}</div>

              {(emotionLabel || intentLabel || m.response_type) && (
                <div style={{ fontSize: "12px", color: "#444" }}>
                  {emotionLabel && <span className="badge emotion">Emosi: {emotionLabel}</span>}

                  {emotionConf != null && !isNaN(emotionConf) && (
                    <span style={{ marginLeft: 6, fontSize: 12 }}>
                      {(Number(emotionConf) * 100).toFixed(0)}%
                    </span>
                  )}

                  {intentLabel && (
                    <span className="badge intent" style={{ marginLeft: 8 }}>
                      Intent: {intentLabel}
                    </span>
                  )}

                  {intentConf != null && !isNaN(intentConf) && (
                    <span style={{ marginLeft: 6, fontSize: 12 }}>
                      {(Number(intentConf) * 100).toFixed(0)}%
                    </span>
                  )}

                  {m.response_type && (
                    <span className="badge response" style={{ marginLeft: 8 }}>
                      {m.response_type}
                    </span>
                  )}
                </div>
              )}

              {m.timestamp && (
                <div style={{ fontSize: "11px", color: "#777", marginTop: "5px", textAlign: "right" }}>
                  {new Date(m.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef}></div>

      {/* Grafik Emosi */}
      <div style={{ marginTop: "20px" }}>
        {stats.length > 0 && <EmotionChart data={stats} />}
      </div>
    </div>
  );
}

