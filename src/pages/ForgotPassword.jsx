// src/pages/ForgotPassword.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPassword.module.css";
import { apiRequest } from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const DAILY_LIMIT = 5; // Същото като на бекенда

  // Таймер за бутона
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setRemaining(null);
    setLoading(true);

    try {
      const data = await apiRequest("/users/forgot-password", "POST", { email });

      setMsg(
        "Ако имейлът съществува, ще получите линк за смяна на паролата. Провери пощата си."
      );
      setCooldown(60);

      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch (err) {
      if (err.error === "daily_limit_reached" && err.remaining !== undefined) {
        setRemaining(err.remaining);
        setError("Достигнат е максималният брой заявки за днес.");
      } else {
        setMsg(
          "Ако имейлът съществува, ще получите линк за смяна на паролата. Провери пощата си."
        );
        console.error("Forgot password error:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  const limitPercentage =
    remaining !== null ? (remaining / DAILY_LIMIT) * 100 : 100;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Забравена парола</h2>

      <form onSubmit={handleSubmit} className={styles.form} autoComplete="on">
        <input
          type="email"
          autoComplete="username"
          placeholder="Имейл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
          disabled={cooldown > 0 || remaining === 0}
        />

        {/* Progress bar за дневния лимит */}
        {remaining !== null && (
          <div className={styles.limitContainer}>
            <div className={styles.limitLabel}>
              Оставащи заявки за днес: {remaining}/{DAILY_LIMIT}
            </div>
            <div className={styles.limitBar}>
              <div
                className={`${styles.limitFill} ${
                  limitPercentage > 40
                    ? styles.limitFillSafe
                    : styles.limitFillWarn
                }`}
                style={{ width: `${limitPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Cooldown bar под бутона */}
        {cooldown > 0 && (
          <div className={styles.cooldownBar}>
            <div
              className={styles.cooldownFill}
              style={{ width: `${(cooldown / 60) * 100}%` }}
            ></div>
          </div>
        )}

        <button
          type="submit"
          className={styles.button}
          disabled={loading || cooldown > 0 || remaining === 0}
        >
          {loading
            ? "Изпращане..."
            : cooldown > 0
            ? `Изчакай ${cooldown}s`
            : remaining === 0
            ? "Лимит изчерпан"
            : "Изпрати линк"}
        </button>
      </form>

      {msg && <p className={styles.msg}>{msg}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.forgotPassword}>
        <Link to="/login">⬅ Връщане към Вход</Link>
      </div>
    </div>
  );
}
