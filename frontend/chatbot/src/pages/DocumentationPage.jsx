// src/pages/DocumentationPage.jsx
import React from "react";

export default function DocumentationPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px", lineHeight: 1.6 }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Dokumentasi Aplikasi Chatbot Pra-Konseling Mahasiswa</h1>

      <section>
        <h2>1. Deskripsi Aplikasi</h2>
        <p>
          Aplikasi chatbot ini dirancang untuk mendukung proses pra-konseling mahasiswa di UPN "Veteran" Jakarta.
          Sistem mampu mendeteksi emosi (senang, sedih, marah, cemas, netral) dan mengenali intent pengguna (curhat,
          meminta saran, mencari informasi). Respon chatbot ditentukan berdasarkan kombinasi emosi dan intent.
        </p>
      </section>

      <section>
        <h2>2. Arsitektur Sistem</h2>
        <p>
          Sistem menggunakan arsitektur Natural Language Processing (NLP) dengan tahapan:
        </p>
        <ol>
          <li>Text Input: Mahasiswa mengirim pesan melalui antarmuka chatbot.</li>
          <li>Preprocessing: Pembersihan data termasuk case folding, tokenizing, stopword removal, dan stemming.</li>
          <li>Feature Extraction: Mengubah teks menjadi vektor numerik menggunakan MiniLM.</li>
          <li>Text Classification & Emotion Detection: Mendeteksi emosi dan intent pengguna.</li>
          <li>Response Generation: Memberikan respons berbasis rule-based atau dynamic generation.</li>
          <li>Output Layer: Menampilkan respons chatbot ke antarmuka mahasiswa secara real-time.</li>
        </ol>
      </section>

      <section>
        <h2>3. Panduan Penggunaan</h2>
        <ol>
          <li>Login menggunakan akun mahasiswa.</li>
          <li>Ketik pesan atau curhat di chatbox.</li>
          <li>Chatbot akan menampilkan respons serta label emosi yang terdeteksi.</li>
          <li>Gunakan fitur saran atau informasi tambahan jika tersedia.</li>
        </ol>
      </section>

      <section>
        <h2>4. Fitur Utama</h2>
        <ul>
          <li>Deteksi emosi mahasiswa secara real-time.</li>
          <li>Pengelompokan intent percakapan.</li>
          <li>Respon chatbot berbasis konteks emosi dan intent.</li>
          <li>Riwayat percakapan mahasiswa tersimpan di database untuk evaluasi.</li>
        </ul>
      </section>

      <section>
        <h2>5. Teknologi yang Digunakan</h2>
        <ul>
          <li>Frontend: ReactJS, HTML, CSS</li>
          <li>Backend: Python (FastAPI / Flask), MongoDB</li>
          <li>NLP: MiniLM, HuggingFace Transformers, Sastrawi, NLTK</li>
          <li>WebSocket: Real-time chat antara mahasiswa dan sistem</li>
        </ul>
      </section>

      <section>
        <h2>6. Struktur Folder Frontend</h2>
        <p>Contoh struktur folder React:</p>
        <pre>
{`
frontend/
├─ src/
│  ├─ api.js
│  ├─ App.jsx
│  ├─ index.css
│  ├─ main.jsx
│  ├─ components/
│  │  └─ ChatWidget.jsx
│  └─ pages/
│     ├─ DocumentationPage.jsx
│     ├─ LoginPageMahasiswa.jsx
│     └─ ChatPage.jsx
`}
        </pre>
      </section>
    </div>
  );
}
