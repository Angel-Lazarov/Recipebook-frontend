// src/pages/EditRecipe.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { capitalize } from "../utils/utils";
import { resizeAndCompressImage, resizeAndCompressMultiple } from "../utils/imageUtils";
import styles from "./EditRecipe.module.css";

const MAX_IMAGES = 5;

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  // const PLACEHOLDER_URL = "https://placehold.co/200x150/cccccc/ffffff?text=Без+снимка";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  // Разделяне на снимки
  const [existingImages, setExistingImages] = useState([]); // url на съществуващи снимки
  const [newImages, setNewImages] = useState([]); // { file, url }
  const [removedExistingImages, setRemovedExistingImages] = useState([]); // за backend
  const [saving, setSaving] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState("");

  useEffect(() => titleRef.current?.focus(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiRequest(`/recipes/${id}`, "GET");
        if (!data) throw new Error("Рецептата не е намерена!");

        const isAuthor = data.authorId === user.id;
        const isAdmin = user.role === "admin";
        if (!isAuthor && !isAdmin) {
          showToast.error("❌ Само авторът или админ може да редактира тази рецепта.");
          navigate("/recipes");
          return;
        }

        setTitle(data.title || "");
        setCategory(data.category || "");
        setIngredients((data.ingredients || []).join(", "));
        setInstructions(data.instructions || "");

        // const imgs = (data.images && data.images.length > 0 ? data.images : [PLACEHOLDER_URL]);
        // setExistingImages(imgs);

        // Взимаме реалните снимки от базата, без placeholder
        setExistingImages(Array.isArray(data.images) ? data.images : []);

        const recipes = await apiRequest("/recipes", "GET");
        const categories = Array.from(
          new Set(recipes.map(r => capitalize(r.category)).filter(Boolean))
        ).sort();
        setAllCategories(categories);
      } catch (err) {
        console.error(err);
        showToast.error("❌ Грешка при зареждане на рецептата!");
        navigate("/recipes");
      }
    };
    fetchData();
  }, [id, user, navigate, showToast]);

  const handleCategoryChange = e => {
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
      setAllCategories(prev => prev.includes(capCategory) ? prev : [capCategory, ...prev]);
      setCategory(capCategory);
    }
    setCreatingCategory(false);
  };

  // Добавяне на нови файлове
  const handleNewFiles = async (e) => {
    const filesArray = Array.from(e.target.files);
    if (!filesArray.length) return;

    const activeCount = existingImages.length + newImages.length;
    const remainingSlots = MAX_IMAGES - activeCount;

    if (remainingSlots <= 0) {
      showToast.error(`❌ Достигнат е максималният брой снимки (${MAX_IMAGES})`);
      e.target.value = "";
      return;
    }

    const filesToAdd = filesArray.slice(0, remainingSlots);

    try {
      let optimizedFiles = [];
      if (filesToAdd.length === 1) {
        optimizedFiles = [await resizeAndCompressImage(filesToAdd[0], 1920, 0.8)];
      } else {
        optimizedFiles = await resizeAndCompressMultiple(filesToAdd, 1920, 0.8);
      }

      const newImgs = optimizedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));

      setNewImages(prev => [...prev, ...newImgs]);
      e.target.value = "";
    } catch (err) {
      console.error("Грешка при оптимизация на изображението:", err);
      showToast.error("❌ Някои изображения не могат да бъдат обработени");
      e.target.value = "";
    }
  };

  // Премахване на съществуваща снимка
  const handleRemoveExisting = url => {
    setExistingImages(prev => prev.filter(u => u !== url));
    setRemovedExistingImages(prev => [...prev, url]);
  };

  // Премахване на нова снимка
  const handleRemoveNew = fileObj => {
    setNewImages(prev => prev.filter(f => f !== fileObj));
    URL.revokeObjectURL(fileObj.url);
  };

  // 🔹 Опростен submit синхронизиран с бекенда
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", capitalize(title));
      formData.append("category", capitalize(category));
      formData.append("ingredients", ingredients);
      formData.append("instructions", instructions);

      // нови файлове
      newImages.forEach(fileObj => formData.append("newFiles", fileObj.file));

      // изтрити съществуващи снимки
      removedExistingImages.forEach(url => formData.append("removedImages[]", url));

      await apiRequest(`/recipes/${id}`, "PUT", formData);
      showToast.success("✅ Рецептата е обновена успешно!");
      navigate(`/recipes/${id}`);
    } catch (err) {
      console.error(err);
      showToast.error("❌ Грешка при обновяване на рецептата!");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(`/recipes/${id}`);

  // Cleanup на blob URLs при unmount
  useEffect(() => {
    return () => {
      newImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [newImages]);

  const activeImagesCount = existingImages.length + newImages.length;
  const canAddMoreImages = activeImagesCount < MAX_IMAGES;

  return (
    <div className={styles.addRecipeContainer}>
      <h2>Редакция на рецептата</h2>
      <form className={styles.addRecipeForm} onSubmit={handleSubmit}>

        <div className={styles.formGroup}>
          <label>Име на рецептата</label>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Супа от зеленчуци"
            disabled={saving}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Категория</label>
          <select value={category} onChange={handleCategoryChange} required disabled={saving}>
            <option value="" disabled hidden>Избери категория или създай нова</option>
            <option value="ADD_NEW_CATEGORY">➕ Добави нова категория</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {creatingCategory && (
            <input
              type="text"
              value={tempCategory}
              onChange={e => setTempCategory(e.target.value)}
              onBlur={handleCategoryBlur}
              autoFocus
              placeholder="Въведи нова категория"
              className={styles.tempCategory}
              disabled={saving}
            />
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Съставки</label>
          <input
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            required
            placeholder="мляко, яйца, захар"
            disabled={saving}
          />
          <small style={{ color: "#555" }}>Разделени със запетая</small>
        </div>

        <div className={styles.formGroup}>
          <label>Инструкции</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            required
            placeholder="Смесете съставките..."
            disabled={saving}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Снимки</label>
          <div className={styles.imagePreviewContainer}>

            {existingImages.length + newImages.length === 0 && (
              <div className={styles.placeholder}>Няма снимка</div>
            )}

            {existingImages.map((url, idx) => (
              <div className={styles.imageWrapper} key={url}>
                <img src={url} alt={`Preview ${idx}`} className={styles.previewImage} />
                <button type="button" className={`${styles.imageBtn} ${styles.removeImageBtn}`} onClick={() => handleRemoveExisting(url)} disabled={saving}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}

            {newImages.map((img, idx) => (
              <div className={styles.imageWrapper} key={img.url}>
                <img src={img.url} alt={`Preview new ${idx}`} className={styles.previewImage} />
                <button type="button" className={`${styles.imageBtn} ${styles.removeImageBtn}`} onClick={() => handleRemoveNew(img)} disabled={saving}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>

          <input type="file" ref={fileInputRef} style={{ display: "none" }} multiple accept="image/*"
            onChange={handleNewFiles} disabled={saving || !canAddMoreImages} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.addImageButton} disabled={saving || !canAddMoreImages}>
            ➕ Добави снимка
          </button>
        </div>

        <div className={styles.formButtons}>
          <button type="submit" disabled={saving}>{saving ? "Запис..." : "Запази"}</button>
          <button type="button" onClick={handleCancel} disabled={saving}>Отказ</button>
        </div>

      </form>
    </div>
  );
}
