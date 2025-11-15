// src/pages/Recipes.jsx
import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import { useToast } from "../context/ToastContext";
import RecipeCard from "../components/RecipeCard";
import styles from "./Recipes.module.css";
import { normalizeString } from "../utils/utils";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    ingredient: "",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await apiRequest("/recipes", "GET");
        const normalized = data.map(r => ({
          ...r,
          category: normalizeString(r.category),
        }));
        setRecipes(normalized || []);

        const cats = Array.from(
          new Set(normalized.map(r => r.category).filter(Boolean))
        ).sort();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch recipes:", err.message);
        showToast.error("❌ Грешка при зареждане на рецептите!");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(r => {
    const nameMatch = r.title.toLowerCase().includes(filters.search.toLowerCase());
    const categoryMatch = !filters.category || normalizeString(r.category) === filters.category;
    const ingredientFilters = filters.ingredient
      .split(',')
      .map(i => i.trim().toLowerCase())
      .filter(Boolean);
    const ingredientMatch = ingredientFilters.every(f =>
      r.ingredients?.some(i => i.toLowerCase().includes(f))
    );
    return nameMatch && categoryMatch && ingredientMatch;
  });

  if (loading) return <p className={styles.message}>Зареждане на рецептите...</p>;
  if (!recipes.length) return <p className={styles.message}>Все още няма добавени рецепти.</p>;

  return (
    <main className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        {/* Филтри */}
        <div className={styles.filtersContainer}>
          <h2>Търси по</h2>

          <div className={styles.filterItem}>
            <label>Име</label>
            <input
              type="text"
              placeholder="Супа от зеленчуци"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div className={styles.filterItem}>
            <label>Категория</label>
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Всички категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label>Съставки</label>
            <input
              type="text"
              placeholder="захар, брашно, яйца"
              value={filters.ingredient}
              onChange={e => setFilters(prev => ({ ...prev, ingredient: e.target.value }))}
            />
          </div>
        </div>

        {/* Grid с карти */}
        <div className={styles.gridWrapper}>
          {filteredRecipes.length === 0 ? (
            <p className={styles.message}>Няма намерени рецепти</p>
          ) : (
            filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
          )}
        </div>
      </div>
    </main>
  );
}
