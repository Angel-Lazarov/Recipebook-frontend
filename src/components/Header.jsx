// src/components/Header.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/api";
import styles from "./Header.module.css";
import { useToast } from "../context/ToastContext";

export default function Header() {
  const { user, logout, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return setProfile(null);
    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/users/me", "GET", null, true);
        setProfile(data);
      } catch {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    showToast.info("👋 Излезе успешно от профила!");
    navigate("/login");
  };

  const handleAdminClick = async (e) => {
    e.preventDefault();
    const latest = await refreshUser().catch(() => null);
    if (!latest || latest.role !== "admin") {
      showToast.warning("⚠️ Вече нямате администраторски права!");
      setProfile(latest || null);
      navigate("/");
      return;
    }
    navigate("/admin");
  };

  const isActive = (path) => location.pathname === path;

  if (loading) return <p>Зареждане на потребителя...</p>;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.left}>
          <a href="/" className={styles.logo}>Recipes App</a>
        </div>

        <nav className={styles.nav}>
          <a
            href="/recipes"
            className={`${styles.link} ${isActive("/recipes") ? styles.activeLink : ""}`}
          >
            Всички рецепти
          </a>

          {profile?.role === "admin" && (
            <a
              href="/admin"
              className={`${styles.link} ${isActive("/admin") ? styles.activeLink : ""}`}
              onClick={handleAdminClick}
            >
              Admin
            </a>
          )}

          {!user && (
            <>
              <a
                href="/login"
                className={`${styles.link} ${isActive("/login") ? styles.activeLink : ""}`}
              >
                Login
              </a>
              <a
                href="/register"
                className={`${styles.link} ${isActive("/register") ? styles.activeLink : ""}`}
              >
                Register
              </a>
            </>
          )}

          {user && (
            <>
              <a
                href="/recipes/mine"
                className={`${styles.link} ${isActive("/recipes/mine") ? styles.activeLink : ""}`}
              >
                Моите рецепти
              </a>
              <a
                href="/recipes/add"
                className={`${styles.link} ${isActive("/recipes/add") ? styles.activeLink : ""}`}
              >
                Добави рецепта
              </a>

              {profile && (
                <a href="/profile" className={styles.userName}>
                  Здравей, {profile.username}!
                </a>
              )}

              <button className={styles.logoutButton} onClick={handleLogout}>
                Изход
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
