//src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { initCsrf } from "./utils/fetchWithCsrf";

async function startApp() {
  // 🧩 Взимаме CSRF токена веднъж при стартиране
  await initCsrf();

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </StrictMode>
  );
}

// 🚀 Стартираме приложението след като CSRF токенът е готов
startApp();