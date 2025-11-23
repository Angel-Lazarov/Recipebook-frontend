// src/pages/Login.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import styles from "./Login.module.css"; // зареждаме модулния CSS

export default function Login() {
  // Състояния за имейл, парола и зареждане
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁 добавено
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // контекст за автентикация
  const { showToast } = useToast(); // контекст за тостове
  const navigate = useNavigate(); // за навигация след успешен вход

  // Функция за вход
  const handleLogin = async (e) => {
    e.preventDefault(); // спираме стандартното поведение на формата
    setLoading(true);

    try {
      // POST заявка към бекенда за логин
      /* const response = await apiRequest("/auth/login", "POST", { email, password });
 
       login(response.userData); // задаваме userData в контекста */
      await apiRequest("/auth/login", "POST", { email, password });

      // 2️⃣ Зареждаме пълния user от бекенда
      await login(); // loadUser() в контекста автоматично извиква /auth/me + /users/me

      showToast.success("✅ Успешно влизане!"); // показваме тост
      navigate("/recipes"); // пренасочваме към всички рецепти
    } catch (err) {
      showToast.error(err.message || "❌ Грешка при логин!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Вход</h2>
      <form onSubmit={handleLogin} className={styles.form} autoComplete="on">
        <input
          type="email"
          name="email"
          autoComplete="username"
          placeholder="Имейл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />

        {/* Поле за парола + бутон за показване */}
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          {/* Бутонче за показване/скриване */}
          <button
            type="button"
            className={styles.showPasswordBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Влизане..." : "Вход"}
        </button>
      </form>

      <p className={styles.forgotPassword}>
        <Link to="/forgot-password">Забравена парола?</Link>
      </p>
    </div>
  );
}
