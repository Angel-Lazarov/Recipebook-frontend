// src/components/LogoutButton.jsx
import React from "react";
import { apiRequest } from "../api/api";

export default function LogoutButton({ onLogout }) {
  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", "POST");
      onLogout(); // изчиства user state
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button onClick={handleLogout} style={{ padding: "8px 16px", margin: "10px", cursor: "pointer" }}>
      Logout
    </button>
  );
}
