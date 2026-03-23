// frontend/chatbot/src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { sendChatMessage, endChatSession, startChatSession } from "../api"; // REST API
import "./ChatPage.css";
import logoUPNVJ from "./logo-upnvj.png";
import { useUser } from "../context/UserContext";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const { user, loading } = useUser();
  const messagesEndRef = useRef(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [popup, setPopup] = useState(null);

  const styles = {
    chatBox: {
      background: "#fff",
      padding: "16px",
      borderRadius: "10px",
      flex: "1",
      overflowY: "auto",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      marginBottom: "16px",
    },
    inputRow: {
      display: "flex",
      gap: "10px",
      marginTop: "12px",
    },
  };

  // =========================
  // SCROLL OTOMATIS
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // SEND MESSAGE (REST API)
  // =========================
  const handleSend = async () => {
    if (!input.trim() || !sessionId || isSending) return;

    setIsSending(true);

    const userMessage = input;
    setInput("");

    // tampilkan pesan user (optimistic UI)
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage }
    ]);

    setIsLoadingResponse(true); // 🔹 mulai loading

    try {
      const data = await sendChatMessage(sessionId, userMessage);

      if (!data) return;

      setMessages((prev) => [
        ...prev,
        {
          sender: "chatbot",
          ...data.message,
          showBookingButton:
            data.message.action === "redirect_booking" ||
            data.message.response_type === "redirect_booking",
        },
      ]);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pesan");
    } finally {
      setIsLoadingResponse(false);
      setIsSending(false);
    }
  };

  // =========================
  // END SESSION
  // =========================
  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      const data = await endChatSession(sessionId);

      const riskLevel = data.risk_level;
      const percentage = data.percentage_negative;
      const consecutive = data.max_consecutive_negative;
      const total = data.total_messages;

      let riskColor = "#4caf50";

      if (riskLevel === "Waspada") riskColor = "#ff9800";
      if (riskLevel === "Tinggi") riskColor = "#f57c00";
      if (riskLevel === "Kritikal") riskColor = "#d32f2f";

      const riskDetailBox = `
      Total Pesan: ${total}
      Jumlah Emosi Negatif: ${(percentage * total / 100).toFixed(0)}
      Persentase Emosi Negatif (Pneg): ${percentage.toFixed(2)}%
      Persistensi Maksimum (Cmax): ${consecutive}
      Kategori Risiko Akhir: ${riskLevel}
      `;

      setMessages((prev) => [
        ...prev,
        {
          sender: "chatbot",
          response_type: "session_summary",
          chatbot_text: data.final_message,
          risk_level: riskLevel,
          percentage_negative: percentage,
          max_consecutive_negative: consecutive,
          total_messages: total,
          risk_color: riskColor,
          risk_detail_box: riskDetailBox,
        },
      ]);

      if (riskLevel === "Tinggi" || riskLevel === "Kritikal") {
        setPopup({
          level: riskLevel,
          message: data.final_message,
        });
      }

      sessionStorage.removeItem("sessionId");
      sessionStorage.removeItem("messages");

      setSessionEnded(true);
      setSessionId(null);

    } catch (err) {
      console.error(err);
      alert("Gagal mengakhiri sesi");
    }
  };

  // load dari sessionStorage saat komponen mount
  useEffect(() => {
    if (!user) return;

    const savedSessionId = sessionStorage.getItem("sessionId");
    const savedMessages = sessionStorage.getItem("messages");
    const savedUserId = sessionStorage.getItem("userId");

    if (savedUserId && savedUserId !== user.id) {
      sessionStorage.removeItem("sessionId");
      sessionStorage.removeItem("messages");
    }

    sessionStorage.setItem("userId", user.id);

    if (savedSessionId) {
      setSessionId(savedSessionId);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    } else {
      const initSession = async () => {
        try {
          const res = await startChatSession();
          setSessionId(res.session_id);
        } catch {
          alert("Gagal memulai sesi chatbot");
        }
      };

      initSession();
    }
  }, [user]);

  useEffect(() => {
    if (sessionEnded) return;   // 🔹 jangan simpan lagi kalau sesi sudah selesai

    if (sessionId) {
      sessionStorage.setItem("sessionId", sessionId);
    }
  }, [sessionId, sessionEnded]);

  useEffect(() => {
    if (!sessionId || sessionEnded) return;

    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages, sessionId, sessionEnded]);

  if (loading) {
    return <div style={{ padding: 20 }}>Memuat data pengguna...</div>;
  }

  // =========================
  // RENDER
  // =========================
  return (

    <div className="chat-page">
      <h2>Chat Mahasiswa</h2>

      <div className="chat-header">
        <img src={logoUPNVJ} alt="UPNVJ" className="chat-logo" />
        <div>
          <div className="chat-title">Chat Pra-Konseling Akademik</div>
          <div className="chat-subtitle">
            Universitas Pembangunan Nasional “Veteran” Jakarta
          </div>
        </div>
      </div>

      <div style={styles.chatBox} className="chat-container">

        {messages.map((msg, i) => {
          const isBot = msg.sender === "chatbot";
          const meta = msg.meta || { is_low_confidence: false, threshold: 0.5 };
          const response = msg.response || {};

          return (
            <div key={i} className={`message-row ${isBot ? "bot" : "user"}`}>
              {!isBot && (
                <div className="bubble user">
                  <div className="bubble-text">{msg.text}</div>
                </div>
              )}

              {isBot && (
                <>
                  <div className="bubble bot">
                    <div className="bubble-text bot-content">

                      {/* ================= PESAN UTAMA ================= */}
                      <div className="bot-message">
                        Respon Chatbot
                      </div>

                      <div className="bot-section">
                        {msg.showBookingButton && msg.chatbot_text ? (
                          // SCENARIO: request konseling → tampilkan chatbot_text + tombol saja
                          <>
                            {msg.chatbot_text.split("\n").map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))}
                            <div style={{ marginTop: "10px" }}>
                              <button
                                onClick={() => {
                                  sessionStorage.removeItem("sessionId");
                                  sessionStorage.removeItem("messages");
                                  setMessages([]);
                                  setSessionId(null);
                                  setSessionEnded(true);
                                  window.location.href = "/booking-konseling";
                                }}
                              >
                                Jadwalkan Konseling
                              </button>
                            </div>
                          </>
                        ) : (
                          // SCENARIO: respons biasa → empathetic_text + suggestion + cta
                          <>
                            {response.empathetic_text && (
                              <div className="bot-section">
                                <strong>Empati:</strong>
                                <div>{response.empathetic_text}</div>
                              </div>
                            )}
                            {response.suggestion && (
                              <div className="bot-section">
                                <strong>Saran:</strong>
                                <div>{response.suggestion}</div>
                              </div>
                            )}
                            {response.cta && (
                              <div className="bot-section">
                                <strong>Pertanyaan Lanjutan:</strong>
                                <div>{response.cta}</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ================= SESSION SUMMARY ================= */}
                  {msg.response_type === "session_summary" && (
                    <div className="session-summary-card">

                      <h3>Ringkasan Sesi Pra-Konseling</h3>

                      <p className="summary-intro">
                        Berdasarkan percakapan yang telah dilakukan, sistem melakukan
                        analisis pola emosi sebagai skrining awal untuk membantu
                        menentukan kebutuhan dukungan lebih lanjut.
                      </p>

                      <div className="summary-grid">
                        <div className="summary-item">
                          <span>Total Interaksi</span>
                          <strong>{msg.total_messages}</strong>
                        </div>

                        <div className="summary-item">
                          <span>Indikasi Emosi Negatif</span>
                          <strong>{msg.percentage_negative?.toFixed(1)}%</strong>
                        </div>

                        <div className="summary-item">
                          <span>Konsistensi Emosi Negatif</span>
                          <strong>{msg.max_consecutive_negative} kali berturut-turut</strong>
                        </div>

                        <div className="summary-item">
                          <span>Status Dukungan</span>
                          <strong style={{ color: msg.risk_color }}>
                            {msg.risk_level}
                          </strong>
                        </div>
                      </div>

                      <div className="summary-explanation">
                        {msg.risk_level === "Normal" && (
                          <p>
                            Saat ini tidak terdeteksi pola emosi yang memerlukan intervensi
                            lanjutan. Namun, kamu tetap dapat menjadwalkan konseling jika
                            merasa membutuhkannya.
                          </p>
                        )}

                        {msg.risk_level === "Waspada" && (
                          <p>
                            Terdapat beberapa indikasi emosi negatif. Disarankan untuk
                            mempertimbangkan sesi konseling agar mendapatkan dukungan
                            yang lebih personal.
                          </p>
                        )}

                        {(msg.risk_level === "Tinggi" || msg.risk_level === "Kritikal") && (
                          <p>
                            Sistem mendeteksi pola emosi yang cukup intens dan konsisten.
                            Sangat disarankan untuk segera menjadwalkan sesi konseling
                            dengan pihak kampus untuk mendapatkan pendampingan profesional.
                          </p>
                        )}
                      </div>

                      <p className="disclaimer">
                        *Hasil ini merupakan skrining berbasis AI dan bukan diagnosis klinis.
                        Keputusan akhir tetap berada pada profesional konseling.*
                      </p>

                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* 🔹 Loading indicator */}
        {isLoadingResponse && (
          <div className="message-row bot">
            <div className="bubble bot">
              <div className="bubble-text bot-content">
                <i>Chatbot sedang mengetik...</i>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={sessionId ? "Ketik pesan..." : "Menyiapkan sesi..."}
          style={{ flex: 1 }}
          disabled={!sessionId}
        />
        <button onClick={handleSend} disabled={!sessionId}>
          Kirim
        </button>
        <button
          onClick={handleEndSession}
          disabled={!sessionId}
          style={{ background: "#f44336", color: "#fff" }}
        >
          Akhiri Sesi
        </button>
      </div>
      {/* ================= POPUP NOTIFIKASI ================= */}
      {popup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Status Risiko: {popup.level}</h3>
            <p>{popup.message}</p>

            {(popup.level === "Tinggi" || popup.level === "Kritikal") && (
              <button
                onClick={() => window.location.href = "/booking-konseling"}
                className="popup-button booking"
              >
                Jadwalkan Konseling
              </button>
            )}

            <button
              onClick={() => setPopup(null)}
              className="popup-button close"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
