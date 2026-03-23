// frontend/src/pages/DashboardMahasiswa.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function DashboardMahasiswa() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Selamat Datang, Mahasiswa</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/chat" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Mulai Chatbot</span>
          <p className="text-gray-500 text-center">Mulai sesi pra-konseling dan asesmen awal.</p>
        </Link>

        <Link to="/profile" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Profil</span>
          <p className="text-gray-500 text-center">Lihat & ubah informasi akun Anda.</p>
        </Link>

        <Link to="/jadwal" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Jadwal Konseling</span>
          <p className="text-gray-500 text-center">Lihat jadwal sesi konseling Anda.</p>
        </Link>
      </div>
    </div>
  );
}
