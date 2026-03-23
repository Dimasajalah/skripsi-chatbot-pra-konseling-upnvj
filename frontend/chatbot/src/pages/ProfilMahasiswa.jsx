// frontend/chatbot/src/pages/ProfilMahasiswa.jsx
import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api";
import MahasiswaLayout from "../layouts/MahasiswaLayout";
import { useUser } from "../context/UserContext";

export default function ProfilMahasiswa() {
  const [profile, setProfile] = useState(null);
  const { setUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error);
  }, []);

  return (
    <MahasiswaLayout>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={styles.pageTitle}>Profil Mahasiswa</h2>
          <p style={styles.pageDesc}>
            Kelola informasi akun Anda yang digunakan dalam sistem pra-konseling.
          </p>
        </div>

        {!profile ? (
          <p>Memuat profil...</p>
        ) : (
          <>
            {/* ================= IDENTITAS AKUN ================= */}
            <div style={styles.identityCard}>
              <div style={styles.avatar}>
                {profile.full_name?.charAt(0)?.toUpperCase() || "M"}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={styles.fullName}>{profile.full_name}</h3>
                <p style={styles.username}>@{profile.username}</p>

                <div style={styles.meta}>
                  <div>
                    <span style={styles.metaLabel}>Email</span>
                    <span style={styles.metaValue}>{profile.email}</span>
                  </div>
                  <div>
                    <span style={styles.metaLabel}>Angkatan</span>
                    <span style={styles.metaValue}>
                      {profile.angkatan || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= FORM EDIT ================= */}
            <div style={{ marginTop: 32 }}>
              <h3 style={styles.sectionTitle}>Perbarui Profil</h3>
              <p style={styles.sectionDesc}>
                Perubahan akan langsung diterapkan pada akun Anda.
              </p>

              {message && (
                <div
                  style={{
                    ...styles.alert,
                    background:
                      message.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color:
                      message.type === "success" ? "#065f46" : "#991b1b",
                    border:
                      message.type === "success"
                        ? "1px solid #a7f3d0"
                        : "1px solid #fecaca",
                  }}
                >
                  {message.text}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  setMessage(null);

                  const full_name = e.target.full_name.value.trim();
                  const email = e.target.email.value.trim();
                  const angkatan = e.target.angkatan.value;
                  const password = e.target.password.value;

                  if (!full_name || !email) {
                    setMessage({
                      type: "error",
                      text: "Nama lengkap dan email wajib diisi.",
                    });
                    setSaving(false);
                    return;
                  }

                  const payload = {
                    full_name,
                    email,
                    angkatan: angkatan ? Number(angkatan) : null,
                  };

                  if (password) payload.password = password;

                  try {
                    await updateProfile(payload);
                    const updatedProfile = await getProfile();

                    setProfile(updatedProfile);
                    setUser(updatedProfile); // 🔥 Navbar sinkron

                    setMessage({
                      type: "success",
                      text: "Profil berhasil diperbarui.",
                    });

                    e.target.password.value = "";
                  } catch (err) {
                    setMessage({
                      type: "error",
                      text: err.message || "Gagal memperbarui profil.",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Lengkap</label>
                  <input
                    name="full_name"
                    defaultValue={profile.full_name}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Angkatan</label>
                  <input
                    name="angkatan"
                    type="number"
                    defaultValue={profile.angkatan || ""}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Password Baru
                    <span style={styles.helper}>
                      (kosongkan jika tidak ingin mengganti)
                    </span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.button,
                    background: saving ? "#94a3b8" : "#6366f1",
                  }}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </MahasiswaLayout>
  );
}

const styles = {
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 600,
  },
  pageDesc: {
    fontSize: "14px",
    color: "#64748b",
  },
  card: {
    display: "flex",
    gap: "20px",
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: "13px",
    color: "#64748b",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#0f172a",
  },
  sectionDesc: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: 16,
  },
  alert: {
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#0f172a",
  },
  helper: {
    fontSize: "12px",
    color: "#64748b",
    marginLeft: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    marginTop: "4px",
  },
  button: {
    marginTop: 16,
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
  },
  identityCard: {
    display: "flex",
    gap: "20px",
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  
  fullName: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    color: "#0f172a",
  },
  
  username: {
    margin: "2px 0 12px",
    fontSize: "14px",
    color: "#64748b",
  },
  
  meta: {
    display: "flex",
    gap: "32px",
  },
  
  metaLabel: {
    display: "block",
    fontSize: "12px",
    color: "#94a3b8",
  },
  
  metaValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#334155",
  },  
};

