// src/pages/Profile.jsx
// Описание: Страница за профила на потребителя. Използва Layout фон и показва форма за промяна на данни и парола.

import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import styles from "./Profile.module.css";

export default function Profile() {
  const [profile, setProfile] = useState(null); // текущ потребител
  const [form, setForm] = useState({ username: "", email: "" }); // данни за редакция
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const { updateUser } = useAuth();
  const { showToast } = useToast();

  // Зареждане на профила при mount
  useEffect(() => {
    apiRequest("/users/me", "GET", null, true)
      .then((data) => {
        setProfile(data);
        setForm({
          username: data.username || "",
          email: data.email || "",
        });
      })
      .catch((err) => console.error("Грешка при зареждане на профила:", err));
  }, []);

  // Обработка на промяна на input полета
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Обработка на промяна на парола
  const handlePassChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Запис на нови данни
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiRequest("/users/me", "PATCH", form);
      const updated = { ...profile, ...form };
      setForm(updated);
      setProfile(updated);
      if (updateUser) updateUser(updated);

      showToast.success("✅ Профилът е обновен успешно!");
    } catch (err) {
      showToast.error("❌ Грешка при обновяване: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Смяна на парола
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmNewPassword } = passwords;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showToast.warning("Моля, попълнете всички полета.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast.error("❌ Новата парола и потвърждението не съвпадат!");
      return;
    }

    setChangingPass(true);
    try {
      await apiRequest("/users/change-password", "POST", { oldPassword, newPassword });
      showToast.success("🔒 Паролата е сменена успешно!");
      setPasswords({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      showToast.error("❌ Грешка при смяна на паролата: " + err.message);
    } finally {
      setChangingPass(false);
    }
  };

  if (!profile) return <div className={styles.loader}>Зареждане...</div>;

  const isChanged = form.username !== profile.username || form.email !== profile.email;

  return (
    <div className={styles.profilePage}>
      <h2>Моят профил</h2>

      {/* Форма за редакция на потребителско име и имейл */}
      <form onSubmit={handleSave} className={styles.profileForm}>
        <label>
          Потребителско име:
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Имейл:
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={!isChanged || saving}>
          {saving ? "Запис..." : "💾 Запази промените"}
        </button>
      </form>

      <hr />

      {/* Форма за смяна на парола */}
      <form onSubmit={handleChangePassword} className={styles.passwordForm}>
        <h3>Смяна на парола</h3>

        <label>
          Стара парола:
          <input
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handlePassChange}
            required
          />
        </label>

        <label>
          Нова парола:
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePassChange}
            required
          />
        </label>

        <label>
          Потвърди новата парола:
          <input
            type="password"
            name="confirmNewPassword"
            value={passwords.confirmNewPassword}
            onChange={handlePassChange}
            required
          />
        </label>

        <button type="submit" disabled={changingPass}>
          {changingPass ? "Обновяване..." : "🔑 Смени паролата"}
        </button>
      </form>
    </div>
  );
}
