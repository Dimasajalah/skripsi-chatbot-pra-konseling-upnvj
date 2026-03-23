//frontend/chatbot/src/api.js
const BACKEND_PORT = 8001;
const BASE_URL = import.meta.env.VITE_API_URL || `${location.protocol}//${location.hostname}:${BACKEND_PORT}`;
const getToken = () => sessionStorage.getItem("token");

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login_mahasiswa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function loginAdmin(username, password) {
  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function loginPsikolog(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login_psikolog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function listSessions(token) {
  const res = await fetch(`${BASE_URL}/admin/sessions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getSessionByUserId(userId, token) {
  const res = await fetch(`${BASE_URL}/admin/sessions/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getEmotionStats(userId, token) {
  const res = await fetch(`${BASE_URL}/admin/emotion-stats/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function Schedules() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/counseling/available`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getMySessions() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/counseling/my-sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }
};

export async function getAllSchedulesAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/schedules`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }
}

const WS_BASE_URL = BASE_URL.startsWith("https")
  ? BASE_URL.replace("https://", "wss://")
  : BASE_URL.replace("http://", "ws://");

export const WS_URL = `${WS_BASE_URL}/ws/chatbot/`;

export async function getAdminNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/notifications`, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

}

export async function getPsikologNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/notifications`, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

}

export async function markNotificationRead(notifId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/notifications/${notifId}/mark-read`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// Ambil semua user (sesuai backend /admin/users)
export async function getAllUsers() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil hasil asesmen emosi";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil hasil asesmen emosi";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// ========== ADMIN COUNSELING REQUESTS ==========
export async function getCounselingRequests() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/counseling/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function rejectCounseling(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/counseling/${sessionId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
};

// Semua chat session (monitoring aktivitas)
export async function getAllChatSessionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// frontend/chatbot/src/api.js
export async function getAllSessionsWithEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archived-emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }


  return res.json();
}

export async function getAllArchivedEmotionsPsikolog() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/archived-emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }


  return res.json();
}

export async function getAllArchivedEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getArchivedEmotions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// Kasus kritis (emotion berisiko)
export async function getCriticalCases() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/critical-cases`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getArchivedChatSessionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/archives/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getArchivedEmotionsAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/archives/emotions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getEmotionSummaryAdmin() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/reports/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getMyChatSessions() {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chat-sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getChatSessionDetail(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chat-sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getSessionBySessionId(sessionId, token) {
  const res = await fetch(`${BASE_URL}/admin/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getEmotionStatsBySessionId(sessionId, token) {
  const res = await fetch(`${BASE_URL}/admin/emotion-stats/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// frontend/src/api/index.js
export const addPsikologSessionNote = async (session_id, notes, status) => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/psikolog/sessions/${session_id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      notes: notes,
      status: status,
    }),
  });

  // 🔐 HANDLE 401
  if (res.status === 401) {
    const role = sessionStorage.getItem("role");
    sessionStorage.clear();

    if (role === "psikolog") window.location.href = "/login/psikolog";
    else if (role === "admin") window.location.href = "/login/admin";
    else window.location.href = "/login";

    return;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // ❌ HANDLE ERROR
  if (!res.ok) {
    let message = "Gagal menambahkan catatan sesi";

    // prioritas ambil dari backend
    if (data) {
      message =
        data.detail?.[0]?.msg ||
        data.detail ||
        data.message ||
        message;
    } else {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return data;
};

export async function acceptCounselingSession(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/sessions/${sessionId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

// frontend/chatbot/src/api.js
export async function getConfirmedSessionsAll() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/psikolog/sessions/confirmed/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getEmotionResultBySession(sessionId) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/admin/sessions/${sessionId}/emotion`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getLatestAssessment() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/assessments/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  const data = await res.json();
  return data.assessment;
}

export async function getChatSessions() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/chat-sessions/chat-sessions/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getMessagesBySession(sessionId) {
  const token = sessionStorage.getItem("token");
  const res = await fetch(
    `${BASE_URL}/messages/messages/session/${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

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
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getMahasiswaNotifications() {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/mahasiswa/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
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

  if (res.status === 401) {
    const role = sessionStorage.getItem("role"); // optional

    sessionStorage.clear();

    if (role === "psikolog") {
      window.location.href = "/login/psikolog";
    } else if (role === "admin") {
      window.location.href = "/login/admin";
    } else {
      window.location.href = "/login";
    }

    return;
  }

  if (!res.ok) {
    let message = "Gagal mengambil";

    try {
      const err = await res.json();
      message = err.detail || err.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getCurrentUser() {
  return getProfile();
}






