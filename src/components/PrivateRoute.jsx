// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute - показва children само ако user е логнат.
 * Ако loading -> може да върне spinner/text.
 */
export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Проверка на потребителя...</p>;
  return user ? children : <Navigate to="/login" replace />;
}

/**
 * RequireAdmin - показва children само ако user.role === 'admin'.
 * Ако user не е логнат -> пренасочва към login.
 * Ако не е админ -> пренасочва към /recipes (или друг fallback).
 */
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Проверка на потребителя...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return user.role === "admin" ? children : <Navigate to="/recipes" replace />;
}

export default PrivateRoute;
