// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import styles from "./Admin.module.css";
import AdminUserRow from "../components/AdminUserRow";

export default function AdminPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  // Проверка веднага при mount — ако user вече няма админ права, редирект
  useEffect(() => {
    const checkAdminOnMount = async () => {
      if (!authLoading) {
        const ok = await ensureStillAdmin();
        if (ok) fetchUsers();
      }
    };
    checkAdminOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Проверка преди всяко важно действие: осигурява, че текущият user пак е админ
  const ensureStillAdmin = async () => {
    const latest = await refreshUser().catch(() => null);
    if (!latest || latest.role !== "admin") {
      showToast.warning("⚠️ Вече нямате администраторски права!");
      navigate("/", { replace: true });
      return false;
    }
    return true;
  };

  // fetchUsers — взема всички потребители от бекенда
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/users", "GET");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.status === 403) {
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // handleRoleChange — промяна на ролята на друг потребител
  const handleRoleChange = async (userId, newRole) => {
    const ok = await ensureStillAdmin();
    if (!ok) return;

    // 🔹 Проверка за собствената роля: няма да позволим бутон за текущия потребител
    if (userId === user.id) {
      showToast.error("🚫 Не можете да сменяте собствената си роля!");
      return;
    }

    const proceed = window.confirm(
      `Сигурни ли сте, че искате да смените ролята на потребителя на "${newRole}"?`
    );
    if (!proceed) return;

    try {
      setSavingId(userId);
      await apiRequest(`/users/${userId}/role`, "PATCH", { role: newRole });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );

      showToast.success("✅ Ролята е сменена успешно!");
    } catch (err) {
      const errorText =
        err?.response?.data?.error || err?.error || err?.message || "";

      if (errorText.includes("собствената си роля")) {
        showToast.error("🚫 Не можете да сменяте собствената си роля!");
      } else if (errorText.includes("Достъпът е отказан")) {
        showToast.error("⚠️ Нямате права да сменяте ролята на този потребител!");
        await ensureStillAdmin();
      } else {
        showToast.error("❌ Грешка при промяна на ролята!");
      }
    } finally {
      setSavingId(null);
    }
  };

  // handleRefresh — обновява списъка с потребители, само ако все още е админ
  const handleRefresh = async () => {
    const ok = await ensureStillAdmin();
    if (!ok) return;
    await fetchUsers();
  };

  // 🔹 Ако все още се зарежда auth или user не е админ — показваме зареждане
  if (authLoading || !user || user.role !== "admin") return <p>Зареждане...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin — Управление на потребители</h1>

      <div className={styles.toolbar}>
        <button onClick={handleRefresh} className={styles.button} disabled={loading}>
          Обнови
        </button>
      </div>

      {loading ? (
        <p>Зареждане на потребителите...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Създаден на</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6">Няма потребители</td>
                </tr>
              ) : (
                users.map(u => (
                  <AdminUserRow
                    key={u.id}
                    user={u}
                    onSaveRole={handleRoleChange}
                    saving={savingId === u.id}
                    // 🔹 Предаваме пропс, за да дезактивираме бутон за собствената роля
                    disableOwnRole={u.id === user.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
