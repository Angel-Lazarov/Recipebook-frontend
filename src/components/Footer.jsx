// src/components/Footer.jsx
import React from "react";
import styles from "./Footer.module.css"; // ако използваш CSS modules

export default function Footer() {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearDisplay = currentYear > startYear ? `${startYear} - ${currentYear}` : `${currentYear}`;

  return (
    <footer className={styles.footer}>
      <p>© {yearDisplay} от Ангел Лазаров</p>
    </footer>
  );
}
