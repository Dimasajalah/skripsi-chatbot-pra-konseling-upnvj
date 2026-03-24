//frontend/chatbot/src/api.js
const BACKEND_PORT = 8001;
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || `${location.protocol}//${location.hostname}:${BACKEND_PORT}`;
const getToken = () => sessionStorage.getItem("token");

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login_mahasiswa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login gagal");
  }

  return res.json();
}

export async function registerUser(username, fullName, password) {
  const res = await fetch(`${BASE_URL}/auth/register_mahasiswa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      full_name: fullName,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registrasi gagal");
  }

  return res.json();
}

export async function registerPsikolog(username, fullName, password, secretKey) {
  const res = await fetch(`${BASE_URL}/auth/register_psikolog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      full_name: fullName,
      password,
      secret_key: secretKey,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registrasi psikolog gagal");
  }

  return res.json();
}

export async function loginAdmin(username, password) {
  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login gagal");
  }

  return res.json();
}

export async function loginPsikolog(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login_psikolog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login gagal");
  }

  return res.json();
}

export async function listSessions(token) {
  const res = await fetch(`${BASE_URL}/admin/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil daftar sesi");
  }

  return res.json();
}

export async function getSessionByUserId(userId, token) {
  const res = await fetch(`${BASE_URL}/admin/sessions/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil history chat");
  }

  return res.json();
}

export async function getEmotionStats(userId, token) {
  const res = await fetch(`${BASE_URL}/admin/emotion-stats/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil statistik emosi");
  }

  return res.json();
}

export async function getProfile() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil profil");
  }

  return res.json();
}

export async function getSchedules() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/schedules/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil jadwal konseling");
  }

  return res.json();
}

export async function Schedules() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/counseling/available`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil jadwal tersedia");
  }
  return res.json();
}

export async function bookSchedule(scheduleId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/counseling/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ schedule_id: scheduleId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal booking jadwal");
  }

  return res.json();
}

export async function getMySessions() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/counseling/my-sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil sesi konseling saya");
  }

  return res.json();
}

export async function respondSession(sessionId, action) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/sessions/${sessionId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal merespons jadwal konseling");
  }

  return res.json();
}

export async function updateProfile({ full_name, email, angkatan, password }) {
  const token = sessionStorage.getItem("token");

  const payload = {
    full_name,
    email,
  };

  // hanya mahasiswa yang punya angkatan
  if (angkatan !== undefined) {
    payload.angkatan = angkatan;
  }

  if (password) {
    payload.password = password;
  }

  const res = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengupdate profil");
  }

  return res.json();
}

export const createSchedule = async (data) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Gagal menambah jadwal");
  return res.json();
};

export const updateScheduleStatus = async (id, status) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/schedules/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Gagal update status jadwal");
  return res.json();
};

export async function getAllSchedulesAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/schedules`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal mengambil semua jadwal");
  return res.json();
}

const WS_BASE_URL = BASE_URL.startsWith("https")
  ? BASE_URL.replace("https://", "wss://")
  : BASE_URL.replace("http://", "ws://");

export const WS_URL = `${WS_BASE_URL}/ws/chatbot/`;

export async function getAdminNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/notifications`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Gagal mengambil notifikasi admin");
  return res.json();
}

export async function getPsikologNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/notifications`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Gagal mengambil notifikasi psikolog");
  return res.json();
}

export async function markNotificationRead(notifId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/notifications/${notifId}/mark-read`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Gagal menandai notifikasi");
  return res.json();
}

export async function getPsikologRecommendationBySession(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/recommendations/session/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil rekomendasi konseling");
  }

  return res.json();
}

export async function fetchAllRecommendations() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/recommendations/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil daftar rekomendasi");
  }

  return res.json(); // akan sesuai struktur backend { recommendations: [...] }
}

// ambil seluruh histori asesmen mahasiswa
export async function getMyAssessmentHistory() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/mahasiswa/assessments/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal ambil riwayat asesmen");
  }

  return res.json(); // return { history: [...] }
}

export async function preparePsikologSchedule(sessionId, scheduleData) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/${sessionId}/schedule`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menyiapkan jadwal konseling");
  }

  return res.json();
}


// Ambil semua user (sesuai backend /admin/users)
export async function getAllUsers() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil data pengguna");
  }

  return res.json();
}

// frontend/chatbot/src/api.js
export async function sendChatMessage(sessionId, text) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chatbot/message`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      text: text,
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(raw || "Gagal mengirim pesan ke chatbot");
  }

  return res.json();
}

export async function endChatSession(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chatbot/end-session/${sessionId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}` // <-- tambahkan ini
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(raw || "Gagal mengakhiri sesi");
  }

  return res.json();
}

export async function startChatSession() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chatbot/start-session`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(raw || "Gagal memulai sesi chatbot");
  }

  return res.json();
}

// === EMOTION RESULT (MAHASISWA) ===
export async function getMyEmotionResults() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/emotion-results/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil hasil asesmen emosi");
  }

  return res.json();
}

// ================= PSIKOLOG =================

// Ambil semua sesi yang ditangani psikolog
export async function getPsikologSessions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil sesi psikolog");
  }

  return res.json();
}

// Ambil isi chat dari 1 sesi (read-only)
export async function getSessionMessages(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/messages/messages/admin/session/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil chat sesi");
  }

  return res.json();
}

// ========== ADMIN COUNSELING REQUESTS ==========
export async function getCounselingRequests() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/counseling/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil permohonan konseling");
  }
  return res.json();
}

export async function scheduleCounseling(sessionId, { date, time }) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/counseling/${sessionId}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ date, time }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menjadwalkan konseling");
  }
  return res.json();
}

export async function rejectCounseling(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/counseling/${sessionId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menolak permohonan konseling");
  }
  return res.json();
}

// === ADMIN MONITORING SISTEM ===
// src/api.js

// Ambil summary laporan sistem
export const getAdminReportSummary = async () => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/reports/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil summary laporan");
  }

  return res.json();
};

// Semua chat session (monitoring aktivitas)
export async function getAllChatSessionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil seluruh chat session");
  }

  return res.json();
}

// frontend/chatbot/src/api.js
export async function getAllSessionsWithEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archived-emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil sesi chat dan emosi");
  }

  return res.json();
}

export async function getAllArchivedEmotionsPsikolog() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/archived-emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil sesi chat dan emosi psikolog");
  }

  return res.json();
}

export async function getAllArchivedEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil hasil emosi");
  }

  return res.json();
}

export async function getArchivedEmotions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil hasil emosi");
  }

  return res.json();
}

// Kasus kritis (emotion berisiko)
export async function getCriticalCases() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/critical-cases`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil kasus kritis");
  }

  return res.json();
}

export async function getArchivedChatSessionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/archives/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil arsip chat session");
  }

  return res.json();
}

export async function getArchivedEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil arsip emosi");
  }

  return res.json();
}

export async function getEmotionSummaryAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/reports/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil ringkasan emosi");
  }

  return res.json();
}

export async function getMyChatSessions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chat-sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Gagal mengambil chat session");

  return res.json();
}

export async function getChatSessionDetail(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chat-sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Gagal mengambil detail session");

  return res.json();
}

export async function getSessionBySessionId(sessionId, token) {
  const res = await fetch(`${BASE_URL}/admin/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil history chat");
  }

  return res.json();
}

export async function getEmotionStatsBySessionId(sessionId, token) {
  const res = await fetch(`${BASE_URL}/admin/emotion-stats/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil statistik emosi");
  }

  return res.json();
}

export async function getPsikologSessionNotes(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/${sessionId}/notes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil catatan psikolog");
  }

  return res.json();
}

// ===============================
// PSIKOLOG - EMOTION RESULT
// ===============================

export async function getPsikologEmotionResult(sessionId) {
  const token = sessionStorage.getItem("token");

  if (!sessionId) {
    throw new Error("Session ID tidak ditemukan");
  }

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/${sessionId}/emotion`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    let errMessage = "Gagal mengambil hasil asesmen";
    try {
      const err = await res.json();
      errMessage = err.detail || errMessage;
    } catch (_) {}
    throw new Error(errMessage);
  }

  return res.json();
}

export async function getCompletedSessions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/completed`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    let errorMessage = "Gagal mengambil daftar sesi selesai";
    try {
      const err = await res.json();
      errorMessage = err.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function completeSession(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/${sessionId}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menyelesaikan session");
  }

  return res.json();
}

// frontend/src/api/index.js
export const addPsikologSessionNote = async (session_id, notes, status) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/psikolog/sessions/${session_id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      notes: notes,
      status: status,
    }),
  });

  let data;
  try {
    data = await response.json(); // coba parse JSON
  } catch (err) {
    data = null; // jika gagal parse
  }

  if (!response.ok) {
    // Ambil message dari JSON jika ada, kalau tidak fallback
    const msg = data?.detail?.[0]?.msg || data?.message || data?.detail || "Gagal menambahkan catatan";
    throw new Error(msg);
  }

  return data; // ini JSON valid kalau response.ok
};

export async function acceptCounselingSession(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/sessions/${sessionId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menerima permintaan konseling");
  }
  return res.json();
}

export async function rejectCounselingSession(sessionId, reason = "") {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/sessions/${sessionId}/reject`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menolak permintaan konseling");
  }
  return res.json();
}

// frontend/chatbot/src/api.js
export async function getConfirmedSessionsAll() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/sessions/confirmed/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil sesi yang sudah dikonfirmasi");
  }
  return res.json();
}

export async function getEmotionResultBySession(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/sessions/${sessionId}/emotion`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) {
    return { session_id: sessionId, total_data: 0, emotion_distribution: {} };
  }

  if (!res.ok) {
    throw new Error("Gagal mengambil hasil emosi");
  }

  return res.json();
}

export async function getLatestAssessment() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/assessments/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil hasil asesmen");
  }

  const data = await res.json();
  return data.assessment;
}

export async function getChatSessions() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/chat-sessions/chat-sessions/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil chat sessions");
  return res.json();
}

export async function getMessagesBySession(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${BASE_URL}/messages/messages/session/${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Gagal mengambil pesan");
  return res.json();
}

export async function closeChatSession(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${BASE_URL}/chat-sessions/chat-sessions/${sessionId}/close`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Gagal menutup sesi");
  return res.json();
}

export async function getMahasiswaNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil notifikasi");
  return res.json();
}

export async function markMahasiswaNotificationRead(notifId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/mahasiswa/notifications/${notifId}/mark-read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menandai notifikasi");
  }

  return res.json();
}

// === ADMIN SESSION NOTES ===
export async function getAdminSessionNotes(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${BASE_URL}/admin/sessions/${sessionId}/notes`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil catatan admin");
  }

  return res.json();
}

export async function addAdminSessionNote(sessionId, content) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${BASE_URL}/admin/sessions/${sessionId}/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menambah catatan admin");
  }

  return res.json();
}

export async function getAllRecommendations() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/recommendations/recommendations/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil daftar rekomendasi");
  }

  return res.json();
}

export async function deleteRecommendation(recommendationId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/recommendations/recommendations/${recommendationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menghapus rekomendasi");
  }

  return res.json();
}

export async function markPsikologNotificationRead(notifId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/notifications/${notifId}/mark-read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menandai notifikasi psikolog");
  }

  return res.json();
}

export async function sendFollowUpNotification(payload) {
  const res = await fetch(
    `${BASE_URL}/psikolog/notifications/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengirim notifikasi");
  }

  return res.json();
}

export async function getCriticalMahasiswa() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/critical-mahasiswa`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil mahasiswa critical");
  }

  return res.json();
}

export async function sendFollowUpFromChatbotSession(sessionId, message) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/chatbot-sessions/${sessionId}/notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengirim notifikasi ke mahasiswa");
  }

  return res.json();
}

export async function getPsikologAvailableTimes() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/sessions/available-times`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil jadwal tersedia");
  }

  return res.json();
}

export async function getMahasiswaSessionNotes(sessionId) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/mahasiswa/sessions/${sessionId}/notes`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal mengambil catatan sesi");
  }

  return res.json();
}

export async function schedulePsikologSession(sessionId, payload) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/psikolog/sessions/${sessionId}/schedule`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Gagal menjadwalkan session");
  }

  return res.json();
}

export async function getCurrentUser() {
  return getProfile();
}







