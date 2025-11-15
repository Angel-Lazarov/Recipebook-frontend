// src/pages/ResetPassword.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api.js";
import styles from "./Login.module.css"; // използваме същия стил
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate(); // за редирект

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiRequest(`/users/reset-password/${token}`, "POST", { newPassword });
      showToast.success(data.msg || "Паролата е сменена успешно!");

      // След успех, пренасочваме към login след кратка пауза
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      showToast.error(err.message || "Грешка при смяна на паролата.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Смяна на парола</h2>
      <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
        <input
          type="password"
          name="newPassword"
          placeholder="Нова парола"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Обработка..." : "Запази новата парола"}
        </button>
      </form>
    </div>
  );
}
