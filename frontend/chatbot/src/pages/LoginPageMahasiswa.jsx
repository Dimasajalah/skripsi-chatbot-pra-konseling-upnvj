// frontend/chatbot/src/pages/LoginPageMahasiswa.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";
import { useUser } from "../context/UserContext";
import bgImage from "./upnvj2.jpg";

export default function LoginPageMahasiswa() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);
      const token = data.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", payload.role);
      sessionStorage.setItem("user_id", payload.user_id);
      sessionStorage.setItem("username", username);

      setUser({
        user_id: payload.user_id,
        role: payload.role,
        username: username,
      });

      navigate("/chat");
    } catch {
      setError("Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: background image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Right side: login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-100">
        <div className="bg-blue-200/80 backdrop-blur-sm shadow-xl rounded-xl p-8 w-full max-w-md flex flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Login Mahasiswa
          </h2>
          <p className="text-gray-700 mb-6 text-center">
            Chatbot Pra Konseling UPNVJ
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col w-full min-w-0">
              <label className="text-gray-700 font-medium mb-1">
                Username / NIM
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
              <label className="text-gray-700 font-medium mb-1">
                Password
              </label>
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
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
            >
              {loading ? "Masuk..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-700 text-sm">
            <p>
              Belum punya akun mahasiswa?{" "}
              <Link className="text-blue-600 hover:underline" to="/register">
                Daftar
              </Link>
            </p>
            <hr className="my-4 border-gray-300" />
            <p>
              Login sebagai{" "}
              <Link className="text-blue-600 hover:underline" to="/admin/login">
                Admin
              </Link>{" "}
              atau{" "}
              <Link className="text-blue-600 hover:underline" to="/psikolog/login">
                Psikolog
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}