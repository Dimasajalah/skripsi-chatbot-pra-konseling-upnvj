// frontend/chatbot/src/pages/LoginPagePsikolog.jsx
import React, { useState } from "react";
import { loginPsikolog } from "../api";
import { Link } from "react-router-dom";
import bgImage from "./upnvj2.jpg";

export default function LoginPagePsikolog() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginPsikolog(username, password);
      const token = res.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", payload.role);
      sessionStorage.setItem("user_id", payload.user_id);

      window.location.href = "/psikolog/dashboard";
    } catch {
      setError("Username atau password salah");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: background */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Right: form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50">
        <div className="bg-blue-200 bg-opacity-90 backdrop-blur-md shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Login Psikolog
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Sistem Konseling UPNVJ
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col w-full min-w-0">
              <label className="text-gray-700 font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full box-border px-4 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>
              Belum punya akun psikolog?{" "}
              <Link className="text-blue-600 hover:underline" to="/psikolog/register">
                Daftar Psikolog
              </Link>
            </p>
            <hr className="my-4 border-gray-300" />
            <p>
              Login sebagai <Link className="text-blue-600 hover:underline" to="/login">Mahasiswa</Link> atau{" "}
              <Link className="text-blue-600 hover:underline" to="/admin/login">Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}