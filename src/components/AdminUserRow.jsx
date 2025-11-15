// src/components/AdminUserRow.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./AdminUserRow.module.css";

export default function AdminUserRow({ user, onSaveRole, saving, disableOwnRole }) {
  const [role, setRole] = useState(user.role || "user");

  // Функция за записване на новата роля
  const handleSave = () => {
    if (role === user.role) return; // няма промяна
    onSaveRole(user.id, role);
  };

  // Форматиране на датата
  const formatDate = (d) => {
    if (!d) return "-";

    // Firestore Timestamp
    if (d.toDate && typeof d.toDate === "function") {
      return d.toDate().toLocaleString();
    }

    // Firebase Admin Timestamp сериализиран в JSON
    if (d._seconds) {
      return new Date(d._seconds * 1000).toLocaleString();
    }

    // ISO string или други валидни дати
    const date = new Date(d);
    return isNaN(date) ? "-" : date.toLocaleString();
  };

  return (
    <tr className={styles.row}>
      <td className={styles.id}>{user.id}</td>
      <td>{user.username || "-"}</td>
      <td>{user.email || "-"}</td>
      <td>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label={`Role for ${user.username || user.email}`}
          disabled={disableOwnRole} // 🔹 блокиране на промяната за текущия потребител
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td>{formatDate(user.createdAt)}</td>
      <td>
        <button
          onClick={handleSave}
          disabled={saving || role === user.role || disableOwnRole} // 🔹 бутонът също се блокира за собствената роля
          className={styles.saveButton}
        >
          {saving ? "Запис..." : "Запази"}
        </button>
      </td>
    </tr>
  );
}

AdminUserRow.propTypes = {
  user: PropTypes.object.isRequired,
  onSaveRole: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  disableOwnRole: PropTypes.bool, // 🔹 нов пропс за блокиране на собствената роля
};
