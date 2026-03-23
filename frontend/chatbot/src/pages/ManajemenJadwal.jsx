// frontend/chatbot/src/pages/ManajemenJadwal.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  getAllSchedulesAdmin,
  createSchedule,
  updateScheduleStatus,
} from "../api";

export default function ManajemenJadwal() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    psychologist_name: "",
    date: "",
    time: "",
  });

  const loadSchedules = async () => {
    try {
      const data = await getAllSchedulesAdmin();
      setSchedules(data || []);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(form);
      setForm({ psychologist_name: "", date: "", time: "" });
      loadSchedules();
    } catch (err) {
      console.error("Gagal menambah jadwal:", err);
    }
  };

  const handleClose = async (id) => {
    try {
      await updateScheduleStatus(id, "closed");
      loadSchedules();
    } catch (err) {
      console.error("Gagal menutup jadwal:", err);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "16px" }}>
          Manajemen Jadwal Konseling
        </h2>

        {/* Form tambah jadwal */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Nama Psikolog"
            value={form.psychologist_name}
            onChange={(e) =>
              setForm({ ...form, psychologist_name: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            required
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            required
          />
          <button type="submit">Tambah Jadwal</button>
        </form>

        {/* List jadwal */}
        <div style={styles.grid}>
          {schedules.length === 0 ? (
            <p>Tidak ada jadwal tersedia.</p>
          ) : (
            schedules.map((s) => (
              <div key={s._id} style={styles.card}>
                <p style={{ fontWeight: "600" }}>
                  {s.psychologist_name}
                </p>
                <p>
                  {s.date} • {s.time}
                </p>

                <span style={styles.badge(s.status)}>
                  {s.status}
                </span>

                {s.status === "available" && (
                  <button
                    style={styles.closeBtn}
                    onClick={() => handleClose(s._id)}
                  >
                    Tutup Jadwal
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "relative",
  },
  badge: (status) => ({
    position: "absolute",
    top: "12px",
    right: "12px",
    background:
      status === "available" ? "#dcfce7" : "#fee2e2",
    color:
      status === "available" ? "#166534" : "#991b1b",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    textTransform: "capitalize",
  }),
  closeBtn: {
    marginTop: "12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
