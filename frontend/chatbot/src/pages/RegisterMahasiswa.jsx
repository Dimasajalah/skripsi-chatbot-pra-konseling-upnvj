// frontend/chatbot/src/pages/RegisterPageMahasiswa.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // <- Link sudah diimport
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
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="bg-blue-200 backdrop-blur-sm shadow-xl rounded-xl p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Register Mahasiswa
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="flex flex-col w-full min-w-0">
              <label className="text-gray-700 font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full box-border px-4 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              />
            </div>

            {/* Nama Lengkap */}
            <div className="flex flex-col w-full min-w-0">
              <label className="text-gray-700 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full box-border px-4 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col w-full min-w-0">
              <label className="text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full box-border px-4 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            >
              {loading ? "Mendaftarkan..." : "Register"}
            </button>
          </form>

          {/* Links Login & Register role lain */}
          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>
              Sudah punya akun mahasiswa?{" "}
              <Link className="text-blue-600 hover:underline" to="/login">
                Login
              </Link>
            </p>
            <hr className="my-4 border-gray-300" />
            <p>
              Daftar sebagai{" "}
              <Link className="text-blue-600 hover:underline" to="/psikolog/register">
                Psikolog
              </Link>{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
