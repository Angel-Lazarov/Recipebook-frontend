// src/components/RecipeCard.jsx
import { useNavigate } from "react-router-dom";
import styles from "./RecipeCard.module.css";
import { normalizeString, truncate } from "../utils/utils"; // truncate остава за стъпките

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const formattedIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.join(", ")
    : recipe.ingredients || "";

  // Взимаме първата снимка от масива или placeholder
  const imageUrl =
    recipe.images && recipe.images.length > 0
      ? recipe.images[0]
      : "https://placehold.co/200x150/cccccc/ffffff?text=Без+снимка";

  return (
    <div
      className={styles.recipeCard}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {/* Заглавие: максимум 2 реда */}
      <h2 className={styles.cardTitle}>{recipe.title}</h2>

      {/* Категория */}
      <p className={styles.cardCategory}>
        <strong>Категория:</strong> {normalizeString(recipe.category) || "Няма"}
      </p>

      {/* Снимка */}
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.placeholder}>Няма снимка</div>
        )}
      </div>

      {/* Съставки: максимум 2 реда */}
      <p className={styles.cardIngredients}>
        <strong>Съставки:</strong> {truncate(formattedIngredients, 50)}
      </p>

      {/* Стъпки: максимум 2 реда с truncate */}
      <p className={styles.cardSteps}>
        <strong>Стъпки:</strong> {truncate(recipe.instructions, 50)}
      </p>
    </div>
  );
}
