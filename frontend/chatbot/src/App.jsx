// frontend/chatbot/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import LoginPageMahasiswa from "./pages/LoginPageMahasiswa.jsx";
import RegisterPageMahasiswa from "./pages/RegisterMahasiswa.jsx";
import LoginPageAdmin from "./pages/LoginPageAdmin.jsx";
import RegisterAdmin from "./pages/RegisterAdmin.jsx";
import RegisterPsikolog from "./pages/RegisterPsikolog.jsx";
import LoginPagePsikolog from "./pages/LoginPagePsikolog.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DashboardPage from "./pages/AdminPage.jsx";
import PsikologDashboard from "./pages/PsikologDashboard.jsx";
import ProfilMahasiswa from "./pages/ProfilMahasiswa.jsx";
import JadwalKonseling from "./pages/JadwalKonseling.jsx";
import HasilAsesmen from "./pages/HasilAsesmen.jsx";
import BookingKonseling from "./pages/BookingKonseling.jsx";
import StatusTindakLanjut from "./pages/StatusTindakLanjut.jsx";
import MonitoringChat from "./pages/MonitoringChat.jsx";
import ManajemenJadwal from "./pages/ManajemenJadwal.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import ProfilPsikolog from "./pages/ProfilPsikolog.jsx";
import ProfilAdmin from "./pages/ProfilAdmin.jsx";
import AdminUserManagement from "./pages/AdminUserManagement.jsx";
import MahasiswaLayout from "./layouts/Mahasiswalayout.jsx";
import AdminCounselingRequests from "./pages/AdminCounselingRequests.jsx";
import AdminSessionDetail from "./pages/AdminSessionDetails.jsx";
import PsikologSchedule from "./pages/PsikologSchedule.jsx";
import HasilAsesmenPsikolog from "./pages/HasilAsesmenPsikolog.jsx";
import CriticalCasesPage from "./pages/CriticalCasesPage.jsx";
import PsikologConfirmed from "./pages/PsikologConfirmed.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ArchivedEmotionsPage from "./pages/ArchivedEmotionsPage.jsx";
import ArchivedEmotionsPsikologPage from "./pages/ArchivedEmotionsPsikologPage.jsx";

function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>404 - Halaman Tidak Ditemukan</h2>
      <p>Silakan cek URL atau login kembali.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* ================= AUTH MAHASISWA ================= */}
          <Route path="/login" element={<LoginPageMahasiswa />} />
          <Route path="/register" element={<RegisterPageMahasiswa />} />

          {/* ================= AUTH ADMIN / PSIKOLOG ================= */}
          <Route path="/admin/login" element={<LoginPageAdmin />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/psikolog/register" element={<RegisterPsikolog />} />
          <Route path="/psikolog/login" element={<LoginPagePsikolog />} />

          {/* ================= MAHASISWA ================= */}
          <Route
            path="/chat"
            element={
              <PrivateRoute role="mahasiswa">
                <MahasiswaLayout>
                  <ChatPage />
                </MahasiswaLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute role="mahasiswa">
                <ProfilMahasiswa />
              </PrivateRoute>
            }
          />
          <Route
            path="/jadwal"
            element={
              <PrivateRoute role="mahasiswa">
                <JadwalKonseling />
              </PrivateRoute>
            }
          />
          <Route
            path="/hasil-asesmen"
            element={
              <PrivateRoute role="mahasiswa">
                <HasilAsesmen />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking-konseling"
            element={
              <PrivateRoute role="mahasiswa">
                <BookingKonseling />
              </PrivateRoute>
            }
          />
          <Route
            path="/status-tindak-lanjut"
            element={
              <PrivateRoute role="mahasiswa">
                <StatusTindakLanjut />
              </PrivateRoute>
            }
          />

          {/* ================= ADMIN ================= */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="admin">
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <PrivateRoute role="admin">
                <MonitoringChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/jadwal"
            element={
              <PrivateRoute role="admin">
                <ManajemenJadwal />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute role="admin">
                <AdminUserManagement />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <PrivateRoute role="admin">
                <ProfilAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/counseling-requests"
            element={
              <PrivateRoute role="admin">
                <AdminCounselingRequests />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/sessions/:sessionId"
            element={
              <PrivateRoute role="admin">
                <AdminSessionDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/critical-cases"
            element={
              <PrivateRoute role="admin">
                <CriticalCasesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/archived-emotions"
            element={
              <PrivateRoute role="admin">
                <ArchivedEmotionsPage />
              </PrivateRoute>
            }
          />

          {/* ================= PSIKOLOG ================= */}
          <Route
            path="/psikolog/dashboard"
            element={
              <PrivateRoute role="psikolog">
                <PsikologDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/psikolog/profile"
            element={
              <PrivateRoute role="psikolog">
                <ProfilPsikolog />
              </PrivateRoute>
            }
          />
          <Route
            path="/psikolog/schedule"
            element={
              <PrivateRoute role="psikolog">
                <PsikologSchedule />
              </PrivateRoute>
            }
          />

          <Route
            path="/psikolog/hasil-asesmen"
            element={
              <PrivateRoute role="psikolog">
                <HasilAsesmenPsikolog />
              </PrivateRoute>
            }
          />

          <Route
            path="/psikolog/confirmed-sessions"
            element={
              <PrivateRoute role="psikolog">
                <PsikologConfirmed />
              </PrivateRoute>
            }
          />

          <Route
            path="/psikolog/confirmed-sessions"
            element={
              <PrivateRoute role="psikolog">
                <PsikologConfirmed />
              </PrivateRoute>
            }
          />

          <Route
            path="/psikolog/archived-emotions"
            element={
              <PrivateRoute role="psikolog">
                <ArchivedEmotionsPsikologPage />
              </PrivateRoute>
            }
          />

          {/* ================= NOT FOUND ================= */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

