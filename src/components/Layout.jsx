// src/components/Layout.jsx

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.mainContent}>
        {/* Wrapper за еднаква ширина с header */}
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
