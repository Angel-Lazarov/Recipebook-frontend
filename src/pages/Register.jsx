/* src/pages/Register.jsx */

import { useState } from "react";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import styles from "./Register.module.css"; // използваме модулния CSS

export default function Register() {
  const [username, setUsername] = useState(""); // потребителско име
  const [email, setEmail] = useState(""); // имейл
  const [password, setPassword] = useState(""); // парола
  const [passwordConfirm, setPasswordConfirm] = useState(""); // повторение на паролата
  const [showPassword, setShowPassword] = useState(false); // 👁 показване на парола
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false); // 👁 показване на повторението
  const [loading, setLoading] = useState(false); // индикатор за чакане
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // проверка дали паролите съвпадат
    if (password.trim() !== passwordConfirm.trim()) {
      showToast.error("Паролите не съвпадат!");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/auth/register", "POST", {
        username,
        email,
        password,
        passwordConfirm
      });

      // Автоматично логване: токенът е HttpOnly cookie
      await login(); // контекстът ще извика /auth/me и /users/me
      showToast.success("Регистрацията е успешна! Добре дошли.");
      navigate("/recipes");

    } catch (err) {
      showToast.error(err?.message || "Грешка при регистрация");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}> {/* контейнер с леко прозрачен фон */}
      <h2 className={styles.title}>Регистрация</h2>

      <form onSubmit={handleSubmit} className={styles.form} autoComplete="on">
        <div className={styles.formGroup}>
          <label htmlFor="username">Потребителско име</label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
            autoComplete="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Имейл</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            autoComplete="email"
          />
        </div>

        {/* Поле за парола + бутон за показване */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Парола</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.showPasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Поле за повторение + бутон за показване */}
        <div className={styles.formGroup}>
          <label htmlFor="passwordConfirm">Повтори паролата</label>
          <div className={styles.passwordWrapper}>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={styles.input}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.showPasswordBtn}
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              {showPasswordConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Регистрация..." : "Регистрирай се"}
        </button>
      </form>
    </div>
  );
}
