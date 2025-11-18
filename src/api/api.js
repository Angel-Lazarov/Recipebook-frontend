// src/api/api.js

import { fetchWithCsrf } from "../utils/fetchWithCsrf.js";

// const BASE_URL = "https://localhost:3443/api";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;;

/**
 * apiRequest
 * @param {string} path - endpoint
 * @param {string} method - GET, POST, PUT, PATCH, DELETE
 * @param {object|null} data - request body
 * @param {boolean} silent401 - ако true, 401 няма да се логва
 */
export async function apiRequest(path, method = "GET", data = null, silent401 = false) {
  const url = `${BASE_URL}${path}`;

  const options = {
    method,
    credentials: "include",
    headers: {},
  };

  if (data instanceof FormData) {
    options.body = data;
  } else {
    options.headers["Content-Type"] = "application/json";
    if (data) options.body = JSON.stringify(data);
  }

  try {
    // 🧩 Ако заявката е промяна на данни – ползваме CSRF wrapper-а
    const res =
      ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
        ? await fetchWithCsrf(url, options)
        : await fetch(url, options);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMessage = errData.error || "Грешка при заявката";

      if (!silent401) {
        console.error("API Error:", errorMessage);
      }

      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json")
      ? await res.json()
      : await res.text();
  } catch (err) {
    if (!(silent401 && err.message.includes("Липсва токен"))) {
      console.error("API Error:", err.message);
    }
    throw err;
  }
}
