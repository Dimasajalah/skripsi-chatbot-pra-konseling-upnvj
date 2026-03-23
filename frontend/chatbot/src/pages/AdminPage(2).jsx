import React, { useEffect, useState } from "react";
import { fetchAllUsers, updateUser, deleteUser } from "../api"; // pastikan ada API updateUser & deleteUser
import "./AdminPage.css";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null); // user yang sedang diedit
  const [formData, setFormData] = useState({ full_name: "", email: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(user) {
    setEditUser(user);
    setFormData({ full_name: user.full_name || "", email: user.email || "" });
  }

  function closeEditModal() {
    setEditUser(null);
    setFormData({ full_name: "", email: "" });
  }

  async function handleUpdateUser() {
    try {
      await updateUser(editUser._id, formData);
      closeEditModal();
      loadUsers();
    } catch (err) {
      console.error("Gagal mengupdate user:", err);
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      console.error("Gagal menghapus user:", err);
    }
  }

  return (
    <div className="admin-page">
      <h1>Data Pengguna Sistem</h1>
      {loading ? (
        <div className="loading">Memuat data pengguna...</div>
      ) : users.length === 0 ? (
        <div className="no-data">Tidak ada user di sistem</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>ID</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id}>
                  <td>{idx + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.full_name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role}</td>
                  <td>{user._id}</td>
                  <td>
                    <button className="btn-edit" onClick={() => openEditModal(user)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User: {editUser.username}</h2>
            <label>
              Full Name:
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleUpdateUser}>Simpan</button>
              <button className="btn-cancel" onClick={closeEditModal}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
