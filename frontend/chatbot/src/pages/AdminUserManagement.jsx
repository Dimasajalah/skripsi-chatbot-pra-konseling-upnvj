// src/pages/AdminUserManagement.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getAllUsers } from "../api";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    console.log("TOKEN DI ADMIN USER:", token);

    if (!token) {
      console.log("TOKEN TIDAK ADA");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        console.log("RESPONSE getAllUsers:", data);

        // aman kalau backend kirim { users: [] } atau []
        const userList = Array.isArray(data)
          ? data
          : data.users || [];

        setUsers(userList);
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <AdminLayout>
      <div style={styles.container}>
        <h2 style={{ marginBottom: 4 }}>Manajemen Data Pengguna</h2>
        <p style={{ marginBottom: 16, color: "#64748b" }}>
          Admin ULBK dapat melihat seluruh pengguna sistem
        </p>

        {loading ? (
          <p>Memuat data...</p>
        ) : users.length === 0 ? (
          <p>Tidak ada data pengguna</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.username}</td>
                  <td style={styles.td}>{u.full_name || "-"}</td>
                  <td style={styles.td}>{u.email || "-"}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>{u.status || "active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
    color: "#111827",
  },
  th: {
    border: "1px solid #e5e7eb",
    padding: "10px",
    background: "#f1f5f9",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "14px",
  },
  td: {
    border: "1px solid #e5e7eb",
    padding: "10px",
    fontSize: "14px",
  },
};

