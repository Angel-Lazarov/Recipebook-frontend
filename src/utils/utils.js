// src/utils/utils.js

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).trim();

// 🔹 Нормализира текст: първа буква главна, останалите малки + trim
export const normalizeString = (str) => {
    if (!str) return "";
    const trimmed = str.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

// 🔹 Ограничава текст до maxLength символа и добавя "..." ако е дълъг
export const truncate = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
