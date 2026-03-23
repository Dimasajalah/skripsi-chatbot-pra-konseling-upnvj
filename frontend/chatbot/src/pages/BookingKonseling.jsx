//frontend/chatbot/src/pages/BookingKonseling.jsx
import React, { useEffect, useState } from "react";
import MahasiswaLayout from "../layouts/MahasiswaLayout";
import { Schedules, bookSchedule } from "../api";
import "react-calendar/dist/Calendar.css";

export default function BookingKonseling() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState({}); // status per row
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const [confirmSchedule, setConfirmSchedule] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const availableDates = schedules.map(
    (s) => new Date(s.date).toDateString()
  );

  useEffect(() => {
    fetchAvailableSchedules();
  }, []);

  // Ambil jadwal yang tersedia
  async function fetchAvailableSchedules() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await Schedules();
      setSchedules(data.schedules || []);
    } catch (err) {
      console.error("Gagal mengambil jadwal:", err);
      setMessage({ type: "error", text: "Gagal mengambil jadwal." });
    } finally {
      setLoading(false);
    }
  }

  // Ajukan booking untuk satu jadwal
  async function handleBookingConfirmed(schedule_id) {
    setBookingStatus((prev) => ({ ...prev, [schedule_id]: true }));
    setMessage(null);

    try {
      await bookSchedule(schedule_id);

      setShowSuccessModal(true);
      setConfirmSchedule(null);
      fetchAvailableSchedules();
    } catch (err) {
      console.error("Error booking:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setBookingStatus((prev) => ({ ...prev, [schedule_id]: false }));
    }
  }

  // Format tanggal dan waktu
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function generateCalendarDays() {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Sen-Ming

    const cells = [];

    // Blank cells sebelum tanggal 1
    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`blank-${i}`} />);
    }

    // Tanggal
    for (let d = 1; d <= lastDate; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      cells.push(
        <div
          key={d}
          style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isWeekend ? "#f0f0f0" : "#e5e7eb",
            borderRadius: 6,
            color: "#1e293b",
            fontWeight: 500,
          }}
        >
          {d}
        </div>
      );
    }

    return cells;
  }

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  
  const modalStyle = {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    width: 350,
    textAlign: "center",
  };
  
  const cancelBtnStyle = {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d9d9d9",
    background: "#fff",
    cursor: "pointer",
    color: "red",
  };
  
  const confirmBtnStyle = {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    background: "#1890ff",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <MahasiswaLayout>
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", color: "#180b0b" }}>
        <h2>Ajukan Permohonan Konseling</h2>
        <p>
          Halaman ini menampilkan jadwal konseling yang tersedia. Silakan pilih jadwal dan
          ajukan permohonan konseling.
        </p>

        {/* LOADING */}
        {loading && <p>Memuat jadwal...</p>}

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              background: message.type === "success" ? "#f6ffed" : "#fff1f0",
              color: message.type === "success" ? "#52c41a" : "#f5222d",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {message.text}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && schedules.length === 0 && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: 24,
              marginTop: 24,
              border: "1px dashed #cbd5e1",
            }}
          >
            <h4 style={{ marginBottom: 8 }}>Jadwal Belum Tersedia</h4>

            <p style={{ fontSize: 14, color: "#475569" }}>
              Saat ini psikolog belum membuka jadwal konseling.
              Silakan cek kembali secara berkala.
            </p>

            {/* Real calendar preview */}
            <div style={{ marginTop: 16 }}>
              {/* Bulan & Tahun dengan navigasi */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontWeight: 600 }}>
                <button onClick={prevMonth} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>‹</button>
                <div>{new Date(currentYear, currentMonth).toLocaleString("id-ID", { month: "long", year: "numeric" })}</div>
                <button onClick={nextMonth} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>›</button>
              </div>

              {/* Grid header hari */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Grid tanggal */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 8,
                }}
              >
                {generateCalendarDays()}
              </div>
            </div>

            <button
              onClick={fetchAvailableSchedules}
              style={{
                marginTop: 16,
                background: "transparent",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: 14,
              }}
            >
              Cek ulang jadwal
            </button>
          </div>
        )}

        {/* LIST JADWAL */}
        {!loading && schedules.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "8px" }}>Tanggal</th>
                <th style={{ padding: "8px" }}>Waktu</th>
                <th style={{ padding: "8px" }}>Psikolog</th>
                <th style={{ padding: "8px" }}>Status</th>
                <th style={{ padding: "8px" }}>Tanggal Dibuat</th>
                <th style={{ padding: "8px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.schedule_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {/* Format tanggal dari backend */}
                  <td style={{ padding: "8px" }}>{formatDate(s.date)}</td>
                  <td style={{ padding: "8px" }}>{s.time}</td>
                  <td style={{ padding: "8px" }}>{s.psychologist_name || "-"}</td>
                  <td style={{ padding: "8px" }}>{s.status === "available" ? "Tersedia" : s.status}</td>
                  <td style={{ padding: "8px" }}>
                    {s.created_at}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <button
                      onClick={() => setConfirmSchedule(s)}
                      disabled={bookingStatus[s.schedule_id] || s.status !== "available"}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor:
                          s.status === "booked"
                            ? "#d9d9d9"
                            : bookingStatus[s.schedule_id]
                              ? "#91d5ff"
                              : "#1890ff",
                        color: s.status === "booked" ? "#595959" : "#fff",
                        cursor:
                          bookingStatus[s.schedule_id] || s.status !== "available"
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 500,
                        transition: "0.2s",
                      }}
                      title={
                        s.status === "booked"
                          ? "Jadwal sudah dibooking"
                          : bookingStatus[s.schedule_id]
                            ? "Sedang mengirim permintaan..."
                            : "Klik untuk ajukan konseling"
                      }
                    >
                      {s.status === "booked"
                        ? "Sudah Dipesan"
                        : bookingStatus[s.schedule_id]
                          ? "Mengirim..."
                          : "Ajukan Konseling"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {confirmSchedule && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3>Konfirmasi Pengajuan</h3>
              <p>
                Anda yakin ingin mengajukan konseling pada:
              </p>
              <p style={{ fontWeight: "600" }}>
                {formatDate(confirmSchedule.date)} <br />
                {confirmSchedule.time} <br />
                {confirmSchedule.psychologist_name}
              </p>

              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmSchedule(null)}
                  style={cancelBtnStyle }
                >
                  Batal
                </button>

                <button
                  onClick={() =>
                    handleBookingConfirmed(confirmSchedule.schedule_id)
                  }
                  style={confirmBtnStyle}
                >
                  Ya, Ajukan
                </button>
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3 style={{ color: "#52c41a" }}>
                Permohonan Berhasil Dikirim
              </h3>
              <p>
                Permintaan konseling Anda telah dikirim ke psikolog.
                Silakan tunggu konfirmasi.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                style={confirmBtnStyle}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </MahasiswaLayout>
  );
}
