// src/components/ToastContainer.jsx

import { useToast } from "../context/ToastContext";
import styles from "./ToastContainer.module.css";

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className={styles.toastWrapper}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
