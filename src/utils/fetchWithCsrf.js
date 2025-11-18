// src/utils/fetchWithCsrf.js

let csrfToken = null;

// 🔹 Взимаме CSRF токена веднъж при стартиране на приложението
export async function initCsrf() {
  // използваме VITE_BACKEND_URL от env
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const res = await fetch(`${BASE_URL}/csrf-token`, {
    credentials: "include", // важно! праща cookie-то към сървъра
  });
  const data = await res.json();
  csrfToken = data.csrfToken;
  console.log("🔐 CSRF token initialized");
}

// 🔹 wrapper около fetch, който автоматично добавя CSRF токена
export async function fetchWithCsrf(url, options = {}) {
  if (!csrfToken) {
    console.warn("⚠️ CSRF token not initialized — calling initCsrf()");
    await initCsrf();
  }

  // const headers = {
  //   "Content-Type": "application/json",
  //   "X-CSRF-Token": csrfToken, // 🧠 важното място
  //   ...(options.headers || {}),
  // };

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    "X-CSRF-Token": csrfToken,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // нужно за cookie сесията
  });

  return response;
}
