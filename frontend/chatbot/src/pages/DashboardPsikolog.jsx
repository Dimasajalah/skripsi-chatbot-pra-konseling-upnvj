// frontend/src/pages/DashboardPsikolog.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function DashboardPsikolog() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Psikolog</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/psikolog/sesi" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Sesi Konseling</span>
          <p className="text-gray-500 text-center">Lihat dan tangani sesi konseling mahasiswa.</p>
        </Link>

        <Link to="/psikolog/jadwal" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Jadwal Konseling</span>
          <p className="text-gray-500 text-center">Lihat jadwal sesi yang sudah dijadwalkan.</p>
        </Link>

        <Link to="/psikolog/asesmen" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Hasil Asesmen</span>
          <p className="text-gray-500 text-center">Review hasil asesmen mahasiswa untuk tindak lanjut.</p>
        </Link>
      </div>
    </div>
  );
}
