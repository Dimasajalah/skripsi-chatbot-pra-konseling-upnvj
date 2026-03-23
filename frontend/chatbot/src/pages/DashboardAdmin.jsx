// frontend/src/pages/DashboardAdmin.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function DashboardAdmin() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/monitoring" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Monitoring Chat</span>
          <p className="text-gray-500 text-center">Pantau aktivitas chat mahasiswa secara realtime.</p>
        </Link>

        <Link to="/admin/jadwal" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Manajemen Jadwal</span>
          <p className="text-gray-500 text-center">Atur jadwal konseling untuk mahasiswa dan psikolog.</p>
        </Link>

        <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center justify-center">
          <span className="text-xl font-semibold mb-2">Kelola Data Pengguna</span>
          <p className="text-gray-500 text-center">Tambah, ubah, hapus akun mahasiswa, admin, atau psikolog.</p>
        </Link>
      </div>
    </div>
  );
}
