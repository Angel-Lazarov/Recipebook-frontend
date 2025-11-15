// src/pages/RecipeDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import styles from "./RecipeDetail.module.css";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const isAuthor = user && recipe && String(user.id).trim() === String(recipe.authorId).trim();
  const isAdmin = user && user.role === "admin";
  const canModify = isAuthor || isAdmin;

  const fetchRecipe = useCallback(async () => {
    if (isDeleted) return;
    try {
      const data = await apiRequest(`/recipes/${id}`, "GET");
      setRecipe(data);
      const authorData = await apiRequest(`/users/${data.authorId}`, "GET");
      setAuthor(authorData);
    } catch (err) {
      console.error("Failed to fetch recipe:", err);
      showToast.error("❌ Рецептата не е намерена!");
    } finally {
      setLoading(false);
    }
  }, [id, isDeleted, showToast]);

  useEffect(() => { fetchRecipe(); }, [fetchRecipe]);

  if (loading || authLoading) return <p className={styles.message}>Зареждане на рецептата...</p>;

  const handleBack = () => navigate(isAuthor ? "/recipes/mine" : "/recipes");
  const handleEdit = () => navigate(`/recipes/${recipe.id}/edit`);
  const handleDelete = async () => {
    if (!canModify) return;
    if (!window.confirm("Сигурен ли сте, че искате да изтриете тази рецепта?")) return;
    try {
      await apiRequest(`/recipes/${recipe.id}`, "DELETE", null, true);
      setIsDeleted(true);
      showToast.success("✅ Рецептата беше успешно изтрита!");
      navigate(isAuthor ? "/recipes/mine" : "/recipes");
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      showToast.error("❌ Грешка при изтриване на рецептата!");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Няма дата";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "Няма дата" : date.toLocaleDateString("bg-BG");
  };

  const nextImage = () => {
    if (!recipe?.images?.length) return;
    setCurrentImageIndex(prev => {
      const nextIdx = (prev + 1) % recipe.images.length;
      setFadeKey(k => k + 1);
      return nextIdx;
    });
  };

  const prevImage = () => {
    if (!recipe?.images?.length) return;
    setCurrentImageIndex(prev => {
      const nextIdx = prev === 0 ? recipe.images.length - 1 : prev - 1;
      setFadeKey(k => k + 1);
      return nextIdx;
    });
  };

  const currentImage = recipe?.images?.length ? recipe.images[currentImageIndex] : null;

  return (
    <div className={styles.recipeDetailContainer}>
      <div className={styles.recipeCard}>
        <h2 className={styles.cardTitle}>{recipe.title}</h2>
        <p className={styles.cardCategory}><strong>Категория:</strong> {recipe.category || "Няма"}</p>

        <div className={styles.ingredients}>
          <strong>Съставки:</strong>
          <ul>{recipe.ingredients?.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </div>

        <div className={styles.instructions}>
          <strong>Инструкции:</strong>
          <p>{recipe.instructions}</p>
        </div>

        {currentImage ? (
          <div className={styles.imageCarousel}>
            <button type="button" className={styles.navButton} onClick={prevImage} aria-label="Предишна снимка">
              &lt;
            </button>

            <img key={fadeKey} src={currentImage}
              alt={`${recipe.title} (${currentImageIndex + 1}/${recipe.images.length})`}
              className={`${styles.carouselImage} ${styles.show}`} />

            <button type="button" className={styles.navButton} onClick={nextImage} aria-label="Следваща снимка">
              &gt;
            </button>

            <div className={styles.imageIndicators}>
              {recipe.images.map((_, idx) => (
                <span key={idx}
                  className={`${styles.indicator} ${idx === currentImageIndex ? styles.active : ""}`}
                  onClick={() => { setCurrentImageIndex(idx); setFadeKey(k => k + 1); }}
                />
              ))}
            </div>
          </div>
        ) : <div className={styles.placeholder}>Няма снимки</div>}

        <div className={styles.cardFooter}>
          <button className={styles.backButton} onClick={handleBack}>Назад</button>
          {canModify && (
            <div className={styles.actionButtons}>
              <button className={styles.editButton} onClick={handleEdit}>Редактирай</button>
              <button className={styles.deleteButton} onClick={handleDelete}>Изтрий</button>
            </div>
          )}
          <span className={styles.dateAuthor}>{formatDate(recipe.createdAt)} | {author?.username}</span>
        </div>
      </div>
    </div>
  );
}
