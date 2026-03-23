// frontend/chatbot/src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import bgImage from "./upnvj2.jpg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left: Hero Text */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Chatbot Deteksi Emosi
            <span className="text-blue-600 block mt-2">
              Pra-Konseling Mahasiswa UPNVJ
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Aplikasi berbasis Natural Language Processing (NLP) 
            untuk membantu mahasiswa menyampaikan kondisi emosional 
            secara nyaman, cepat, dan aman sebelum melanjutkan 
            ke sesi konseling formal.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
            >
              Mulai Pra-Konseling
            </Link>

            <Link
              to="/admin/login"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Login Admin 
            </Link>

            <Link
              to="/psikolog/login"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Login Psikolog
            </Link>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="hidden md:flex justify-center">
          <img
            src={bgImage}
            alt="Hero"
            className="rounded-2xl shadow-lg object-cover max-h-96"
          />
        </div>
      </section>

      {/* MASALAH SECTION */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Mengapa Aplikasi Ini Dibutuhkan?
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto">
            Proses pra-konseling manual sering memerlukan waktu lama, 
            belum memiliki asesmen awal terstruktur, serta membuat 
            mahasiswa enggan menyampaikan kondisi emosional secara langsung. 
            Chatbot ini hadir sebagai sarana skrining awal non-klinis 
            yang membantu efisiensi layanan ULBK UPN Veteran Jakarta.
          </p>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Fitur Utama Sistem
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">
              Analisis NLP Berbasis MiniLM
            </h3>
            <p className="text-gray-600 text-sm">
              Menggunakan model transformer untuk mendeteksi emosi 
              dan intent percakapan mahasiswa secara lebih akurat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">
              Respons Empatik Otomatis
            </h3>
            <p className="text-gray-600 text-sm">
              Memberikan saran awal berdasarkan kondisi emosional 
              tanpa menggantikan diagnosis profesional.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">
              Integrasi Layanan ULBK
            </h3>
            <p className="text-gray-600 text-sm">
              Mendukung proses pengajuan dan penjadwalan konseling 
              lanjutan bagi mahasiswa yang membutuhkan.
            </p>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-600">
          Aplikasi ini bersifat pra-konseling non-klinis dan tidak 
          memberikan diagnosis psikologis. Untuk kondisi darurat atau 
          membutuhkan bantuan profesional segera, silakan hubungi 
          layanan konseling resmi UPN Veteran Jakarta.
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-600 text-white py-6 text-center text-sm">
        © 2026 Chatbot Pra-Konseling UPN Veteran Jakarta | 
        Skripsi Dimas Anggoro Sakti - Informatika
      </footer>
    </div>
  );
}