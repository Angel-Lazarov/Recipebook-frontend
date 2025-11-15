// src/pages/AddRecipe.jsx
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { capitalize } from "../utils/utils";
import styles from "./AddRecipe.module.css";
import { resizeAndCompressImage, resizeAndCompressMultiple } from "../utils/imageUtils";

const MAX_IMAGES = 5; // Максимум снимки за една рецепта

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);
  const [files, setFiles] = useState([]); // Съхраняваме реалните файлове
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const recipes = await apiRequest("/recipes", "GET");
        const categories = Array.from(
          new Set(recipes.map((r) => capitalize(r.category)).filter(Boolean))
        );
        setAllCategories(categories);
      } catch (err) {
        console.error("Грешка при зареждане на категориите:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_CATEGORY") {
      setCreatingCategory(true);
      setTempCategory("");
    } else {
      setCategory(value);
      setCreatingCategory(false);
    }
  };

  const handleCategoryBlur = () => {
    if (creatingCategory && tempCategory.trim()) {
      const capCategory = capitalize(tempCategory);
      setAllCategories((prev) =>
        prev.includes(capCategory) ? prev : [capCategory, ...prev]
      );
      setCategory(capCategory);
    }
    setCreatingCategory(false);
  };

  // Обработка на избрани файлове
  const handleFilesChange = async (selectedFiles) => {
    if (!selectedFiles.length) return;

    const filesArray = Array.from(selectedFiles);

    if (files.length + filesArray.length > MAX_IMAGES) {
      showToast.error(`❌ Можете да качите максимум ${MAX_IMAGES} снимки!`);
      return;
    }

    let optimizedFiles = [];

    try {
      if (filesArray.length === 1) {
        const optimized = await resizeAndCompressImage(filesArray[0], 1920, 0.8);
        optimizedFiles = [optimized];
      } else {
        optimizedFiles = await resizeAndCompressMultiple(filesArray, 1920, 0.8);
      }

      const urls = optimizedFiles.map((file) => URL.createObjectURL(file));

      setPreviewUrls((prev) => [...prev, ...urls]);
      setFiles((prev) => [...prev, ...optimizedFiles]);
    } catch (err) {
      console.error("Грешка при оптимизация на изображението:", err);
      showToast.error("❌ Някои изображения не могат да бъдат обработени");
    }
  };

  const handleRemoveImage = (idx) => {
    setPreviewUrls((prev) => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[idx]);
      newArr.splice(idx, 1);
      return newArr;
    });
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(idx, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", capitalize(title));
      formData.append("category", capitalize(category));
      formData.append("ingredients", ingredients);
      formData.append("instructions", instructions);

      // Добавяме само файловете, които не са премахнати
      files.forEach((file) => formData.append("newFiles", file));

      await apiRequest("/recipes", "POST", formData);
      showToast.success("Рецептата е добавена успешно!");
      navigate("/recipes/mine");
    } catch (err) {
      console.error("Add recipe failed:", err);
      showToast.error("Грешка при добавяне на рецептата!");
    } finally {
      setSaving(false);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setFiles([]);
    }
  };

  const handleCancel = () => navigate("/recipes/mine");

  return (
    <div className={styles.addRecipeContainer}>
      <h2>Добавяне на рецепта</h2>
      <form className={styles.addRecipeForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Име на рецептата</label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Супа от зеленчуци"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Категория</label>
          <select value={category} onChange={handleCategoryChange} required>
            <option value="" disabled hidden>
              Избери категория или създай нова
            </option>
            <option value="ADD_NEW_CATEGORY">➕ Добави нова категория</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {creatingCategory && (
            <input
              type="text"
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value)}
              onBlur={handleCategoryBlur}
              autoFocus
              placeholder="Въведи нова категория"
              className={styles.tempCategory}
            />
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Съставки</label>
          <input
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            placeholder="мляко, яйца, захар"
          />
          <small>Разделени със запетая</small>
        </div>

        <div className={styles.formGroup}>
          <label>Инструкции</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
            placeholder="Смесете съставките..."
          />
        </div>

        <div className={styles.formGroup}>
          <button
            type="button"
            className={styles.addImageBtn}
            onClick={() => fileInputRef.current.click()}
          >
            ➕ Добави снимка
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFilesChange(e.target.files)}
          />

          {previewUrls.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {previewUrls.map((url, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => handleRemoveImage(idx)}
                    aria-label="Премахни изображението"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="#000"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formButtons}>
          <button type="submit" disabled={saving}>
            {saving ? "Запис..." : "Добави"}
          </button>
          <button type="button" onClick={handleCancel}>
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
}
