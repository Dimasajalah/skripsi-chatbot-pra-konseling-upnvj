import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // Registrasi mahasiswa
        const data = await registerUser(username, fullName, password);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", "mahasiswa");
        localStorage.setItem("user_id", data.user_id);
        navigate("/chat");
      } else {
        // Login mahasiswa
        const data = await loginUser(username, password);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", "mahasiswa");
        localStorage.setItem("user_id", data.user_id);
        navigate("/chat");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="auth-page" style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>
        {isRegister ? "Registrasi Mahasiswa" : "Login Mahasiswa"}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {isRegister && (
          <div>
            <label>Nama Lengkap:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">
          {isRegister ? "Daftar" : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "10px", textAlign: "center" }}>
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <button onClick={toggleMode} style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}>
          {isRegister ? "Login" : "Daftar"}
        </button>
      </p>
    </div>
  );
}
