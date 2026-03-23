// frontend/chatbot/src/pages/MonitoringChat.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getAllChatSessionsAdmin } from "../api";
import SessionList from "../components/SessionList";
import ChatHistory from "../components/ChatHistory";

export default function MonitoringChat() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const token = sessionStorage.getItem("token");
  const selectedSessionId = selectedSession?.session_id;

  const selectedUserId =
    selectedSession?.user_id ||
    selectedSession?.student_id ||
    selectedSession?.session_id;

  useEffect(() => {
    if (!token) return;

    getAllChatSessionsAdmin()
      .then((res) => setSessions(res.sessions ?? res ?? []))
      .catch(console.error);
  }, [token]);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* LEFT: SESSION LIST */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Monitoring Chat</h3>

          <SessionList
            sessions={sessions}
            selected={selectedUserId}
            onSelect={(userId) => {
              const found = sessions.find(
                (s) =>
                  s.user_id === userId ||
                  s.student_id === userId ||
                  s.session_id === userId
              );
              setSelectedSession(found || null);
            }}
          />

        </aside>

        {/* RIGHT: CHAT VIEWER */}
        <section style={styles.chatPanel}>
          {!selectedSession ? (
            <div style={styles.emptyState}>
              <p>Pilih sesi mahasiswa untuk melihat percakapan</p>
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <h4>{selectedSession.name || selectedUserId}</h4>
                <span>
                  Status:{" "}
                  {selectedSession.critical_detected ? "⚠️ Kritis" : "Normal"}
                </span>
              </div>

              {selectedSessionId && (
                <ChatHistory
                  sessionId={selectedSessionId}
                  token={token}
                />
              )}
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "20px",
    height: "calc(100vh - 120px)",
    color: "#000000",
  },

  sidebar: {
    width: "300px",
    background: "#8770b4",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflowY: "auto",
  },

  sidebarTitle: {
    marginBottom: "12px",
    fontSize: "18px",
    color: "#000000",
    fontWeight: "600",
  },

  chatPanel: {
    flex: 1,
    background: "#8770b4",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  },

  chatHeader: {
    padding: "16px",
    borderBottom: "1px solid #ffffff",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "600",
  },

  chatBody: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },

  chatBubble: (sender) => ({
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    background: "#000000",
    color: "#ffffff",
    alignSelf: sender === "user" ? "flex-end" : "flex-start",
  }),

  timestamp: {
    fontSize: "11px",
    opacity: 0.7,
    marginTop: "4px",
  },

  emptyState: {
    margin: "auto",
    color: "#000000",
  },
};
