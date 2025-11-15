// src/pages/MyRecipes.jsx
import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import { useToast } from "../context/ToastContext";
import RecipeCard from "../components/RecipeCard";
import styles from "./MyRecipes.module.css";

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const data = await apiRequest("/recipes/mine", "GET");
        if (Array.isArray(data)) setRecipes(data);
        else if (data.recipes) setRecipes(data.recipes);
        else setRecipes([]);
      } catch (err) {
        console.error("Failed to fetch my recipes:", err);
        showToast.error("❌ Грешка при зареждане на твоите рецепти!");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  if (loading) return <p className={styles.message}>Зареждане на твоите рецепти...</p>;
  if (!recipes.length) return <p className={styles.message}>Все още нямаш рецепти.</p>;

  return (
    <main className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <div className={styles.gridWrapper}>
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </main>
  );
}
