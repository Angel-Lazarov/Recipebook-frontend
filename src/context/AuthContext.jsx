// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, username, email, role, ... }
  const [loading, setLoading] = useState(true);

  // Нормализира различните форми на отговор от бекенда до един user обект
  const normalizeUser = (res) => {
    if (!res) return null;
    // /auth/me -> { user: { userId, role } }
    if (res.user && (res.user.userId || res.user.role)) {
      // възможно е да нямаме пълна инфо — ще опитаме /users/me по-късно
      return { id: res.user.userId, role: res.user.role };
    }
    // /users/me -> { id, username, email, role }
    if (res.id || res.username || res.email) {
      return { id: res.id, username: res.username, email: res.email, role: res.role };
    }
    // други форми
    return null;
  };

  // Зарежда потребителя: опитваме /auth/me, след това /users/me за пълна информация
  const loadUser = async () => {
    setLoading(true);
    try {
      // Първо опитваме /auth/me — то дава userId+role в твоя бекенд
      const authMe = await apiRequest("/auth/me", "GET", null, true).catch(() => null);
      const normalizedAuth = normalizeUser(authMe);

      // Ако получим userId -> взимаме пълния обект от /users/me
      if (normalizedAuth && normalizedAuth.id) {
        const full = await apiRequest("/users/me", "GET", null, true).catch(() => null);
        const normalizedFull = normalizeUser(full);
        if (normalizedFull) {
          setUser(normalizedFull);
          return normalizedFull;
        }
        // fallback: можем да използваме частичния auth отговор
        setUser(normalizedAuth);
        return normalizedAuth;
      }

      // Ако /auth/me не върна нищо полезно, опитваме директно /users/me
      const usersMe = await apiRequest("/users/me", "GET", null, true).catch(() => null);
      const normalizedUser = normalizeUser(usersMe);
      setUser(normalizedUser || null);
      return normalizedUser || null;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Извикваме /users/me и връщаме обновения user (или null)
  const refreshUser = async () => {
    try {
      const data = await apiRequest("/users/me", "GET", null, true);
      const normalized = normalizeUser(data);
      if (!normalized) {
        setUser(null);
        return null;
      }
      setUser(normalized);
      return normalized;
    } catch (err) {
      // ако няма авторизация или друга грешка -> setNull
      setUser(null);
      return null;
    }
  };

  // login: запазваме и опитваме да заредим пълни данни
  const login = async (userData) => {
    setUser(userData || null);
    // след логин винаги опитваме да вземем пълните данни
    return await loadUser();
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", "POST");
    } catch {}
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ user, loadUser, refreshUser, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
