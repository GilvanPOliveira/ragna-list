import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ListaPage from "./pages/ListaPage";
import InventarioPage from "./pages/InventarioPage";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/shared/Navbar";
import SearchResultsPage from "./pages/SearchResultsPage";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Páginas protegidas */}
        <Route
          path="/minha-lista"
          element={user ? <ListaPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/inventario"
          element={user ? <InventarioPage /> : <Navigate to="/login" replace />}
        />
<Route path="/busca" element={<SearchResultsPage />} />
        {/* Autenticação */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
