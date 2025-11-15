// src/utils/imageUtils.js

/**
 * resizeAndCompressImage
 * @param {File} file - оригиналният файл от input
 * @param {number} maxSize - максимална дълга страна в px (по подразбиране 1920)
 * @param {number} quality - WebP качество (0–1), по подразбиране 0.8
 * @returns {Promise<File>} оптимизиран File обект
 */
export const resizeAndCompressImage = (file, maxSize = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) return reject(new Error("Файлът не е изображение"));

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            let { width, height } = img;

            // изчисляване на нови размери без изрязване
            if (width > height && width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            } else if (height > width && height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            } else if (width > maxSize) { // квадратна снимка
                width = maxSize;
                height = maxSize;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // конвертираме в WebP за по-малък размер
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Грешка при обработка на изображението"));
                    resolve(new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => reject(new Error("Грешка при зареждане на изображението"));
    });
};

/**
 * resizeAndCompressMultiple
 * @param {File[]} files - масив от избрани файлове
 * @param {number} maxSize - максимална дълга страна
 * @param {number} quality - качество WebP
 * @returns {Promise<File[]>} масив с оптимизирани файлове
 */
export const resizeAndCompressMultiple = async (files, maxSize = 1920, quality = 0.8) => {
    const results = [];
    for (const file of files) {
        try {
            const optimized = await resizeAndCompressImage(file, maxSize, quality);
            results.push(optimized);
        } catch (err) {
            console.warn(`Файл ${file.name} не можа да се обработи:`, err.message);
        }
    }
    return results;
};
