//frontend/chatbot/src/pages/Docspage.jsx
import React from "react";
import "./DocsPage.css";

export default function DocsPage() {
  return (
    <div className="docs-page">
      <h1>Dokumentasi Chatbot Pra-Konseling</h1>
      <section>
        <h2>1. Tujuan Chatbot</h2>
        <p>
          Chatbot ini dirancang untuk mendukung proses pra-konseling mahasiswa
          dengan mendeteksi emosi dan maksud pesan (intent) yang dikirimkan.
        </p>
      </section>

      <section>
        <h2>2. Cara Menggunakan</h2>
        <ol>
          <li>Login menggunakan akun mahasiswa UPN Veteran Jakarta.</li>
          <li>Buka halaman Chatbot Mahasiswa.</li>
          <li>Ketik pertanyaan, keluhan, atau curahan perasaan pada kolom chat.</li>
          <li>Kirim pesan dengan menekan Enter atau tombol Kirim.</li>
          <li>Chatbot akan merespons dengan teks, serta menampilkan emosi dan confidence.</li>
        </ol>
      </section>

      <section>
        <h2>3. Tampilan Chatbot</h2>
        <p>
          Chatbot menampilkan pesan pengguna dan pesan bot secara berurutan. Setiap pesan bot
          menampilkan:
        </p>
        <ul>
          <li>Emosi yang terdeteksi (Senang, Sedih, Marah, Cemas, Netral)</li>
          <li>Confidence level deteksi emosi</li>
          <li>Intent pesan (Curhat, Meminta Saran, Mencari Informasi)</li>
        </ul>
      </section>

      <section>
        <h2>4. Tips Interaksi</h2>
        <ul>
          <li>Gunakan kalimat lengkap agar chatbot lebih akurat mendeteksi emosi.</li>
          <li>Hindari kata-kata yang ambigu atau terlalu singkat.</li>
          <li>Gunakan bahasa Indonesia formal/semi-formal untuk hasil terbaik.</li>
        </ul>
      </section>

      <section>
        <h2>5. Catatan</h2>
        <p>
          Semua percakapan dicatat dan dianalisis untuk keperluan monitoring dan evaluasi
          oleh Admin ULBK dan Psikolog. Data bersifat rahasia dan hanya diakses oleh pihak berwenang.
        </p>
      </section>
    </div>
  );
}
