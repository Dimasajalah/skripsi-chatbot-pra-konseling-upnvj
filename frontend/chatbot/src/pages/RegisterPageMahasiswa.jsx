// frontend/chatbot/src/pages/RegisterPageMahasiswa.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import bgImage from "./upnvj2.jpg";

export default function RegisterPageMahasiswa() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(username, fullName, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", "mahasiswa");
      navigate("/chat");
    } catch {
      setError("Gagal registrasi, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Background Image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Right: Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50">
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register Mahasiswa
          </h2>

          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Username / NIM</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            >
              {loading ? "Mendaftarkan..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}