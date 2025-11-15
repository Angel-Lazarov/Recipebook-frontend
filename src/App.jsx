// src/App.jsx
// Основен компонент, който използва Layout за общата структура и фон

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout"; // 🆕 Използваме Layout
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import MyRecipes from "./pages/MyRecipes";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe"; // 🆕 Нашият нов компонент
import Profile from "./pages/Profile";
import ToastContainer from "./components/ToastContainer";
import AdminPage from "./pages/AdminPage";
import { RequireAdmin } from "./components/PrivateRoute";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <p>Проверка на потребителя...</p>;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/login" element={user ? <Navigate to="/recipes" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/recipes" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Public */}
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />

          {/* Protected */}
          <Route path="/recipes/mine" element={user ? <MyRecipes /> : <Navigate to="/login" />} />
          <Route path="/recipes/add" element={user ? <AddRecipe /> : <Navigate to="/login" />} />
          <Route path="/recipes/:id/edit" element={user ? <EditRecipe /> : <Navigate to="/login" />} /> {/* 🆕 */}
          <Route path="/profile" element={<Profile />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/recipes" />} />
        </Routes>
      </Layout>

      <ToastContainer />
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}
