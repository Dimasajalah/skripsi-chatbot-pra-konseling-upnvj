// frontend/chatbot/src/components/SessionList.jsx
import React, { useMemo, useState } from "react";

export default function SessionList({
  sessions = [],
  onSelect,
  selected,
  onOpenDetail, // OPTIONAL (tidak mengganggu pemanggil lama)
}) {
  const [search, setSearch] = useState("");

  // ===== SORT + FILTER =====
  const groupedSessions = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const userId = s.user_id || s.student_id || s.session_id;
      // gunakan session terbaru per user
      if (!map[userId] || new Date(s.created_at) > new Date(map[userId].created_at)) {
        map[userId] = s;
      }
    });
    return Object.values(map);
  }, [sessions]);

  const processedSessions = useMemo(() => {
    return groupedSessions
      .filter((s) => {
        if (!search) return true;
        const userId = s.user_id || s.student_id || s.session_id || "";
        const name = s.name || "";
        return (
          userId.toLowerCase().includes(search.toLowerCase()) ||
          name.toLowerCase().includes(search.toLowerCase())
        );
      })
      .sort((a, b) => {
        // 1️⃣ KRITIS
        if (a.critical_detected && !b.critical_detected) return -1;
        if (!a.critical_detected && b.critical_detected) return 1;

        // 2️⃣ ACTIVE
        const aActive = a.status === "active" || a.status_session === "active";
        const bActive = b.status === "active" || b.status_session === "active";
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        // 3️⃣ fallback: terbaru
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [groupedSessions, search]);

  return (
    <div>
      {/* === JUDUL LAMA (TIDAK DIUBAH) === */}
      <h3 style={{ marginBottom: "12px" }}>Daftar Mahasiswa</h3>

      {/* === SEARCH (FITUR BARU, TIDAK WAJIB DIPAKAI) === */}
      <input
        type="text"
        placeholder="Cari mahasiswa / user ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          fontSize: "13px",
        }}
      />

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {processedSessions.map((s) => {
          const userId = s.user_id || s.student_id || s.session_id; // ✅ TAMBAH INI
          const key = s.session_id || `${s.user_id}-${s.created_at}`;
          const status = s.status || s.status_session || "unknown";
          const isSelected = selected === userId;
          const isCritical = s.critical_detected === true;

          return (
            <li
              key={key}
              onClick={() => {
                onSelect(userId);   // behavior lama
                onOpenDetail?.(s);  // tambahan aman
              }}
              style={{
                padding: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                background: isSelected ? "#0d6efd" : "#ffffff",
                color: isSelected ? "#fff" : "#000",
                borderRadius: "10px",
                border: isSelected
                  ? "1px solid #0d6efd"
                  : "1px solid #e5e7eb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
            >
              {/* ===== HEADER (STRUKTUR LAMA) ===== */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "15px" }}>
                  {s.name || userId}
                </div>

                {/* BADGES (LAMA) */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {isCritical && (
                    <span style={badgeStyle("#dc3545")}>KRITIS</span>
                  )}
                  <span
                    style={badgeStyle(
                      status === "active" ? "#0d6efd" : "#6c757d"
                    )}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* ===== META (LAMA, 100% UTUH) ===== */}
              <div style={{ marginTop: "6px", fontSize: "12px", opacity: 0.85 }}>
                {"message_count" in s && (
                  <div>💬 Pesan: {s.message_count}</div>
                )}

                {s.created_at && (
                  <div>
                    🕒 Dibuat:{" "}
                    {new Date(s.created_at).toLocaleString("id-ID")}
                  </div>
                )}

                {s.closed_at && (
                  <div>
                    ⛔ Ditutup:{" "}
                    {new Date(s.closed_at).toLocaleString("id-ID")}
                  </div>
                )}
              </div>
            </li>
          );
        })}

        {/* EMPTY STATE (BARU, TIDAK MENGGANGGU) */}
        {processedSessions.length === 0 && (
          <li style={{ fontSize: "13px", color: "#6b7280" }}>
            Tidak ada sesi ditemukan
          </li>
        )}
      </ul>
    </div>
  );
}

const badgeStyle = (bg) => ({
  background: bg,
  color: "#fff",
  fontSize: "11px",
  padding: "2px 8px",
  borderRadius: "999px",
  fontWeight: 600,
});
