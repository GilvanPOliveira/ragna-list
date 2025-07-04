import { Routes, Route, Navigate } from "react-router-dom";

import HomePage       from "./pages/HomePage";
import LoginPage      from "./pages/Auth/LoginPage";
import RegisterPage   from "./pages/Auth/RegisterPage";
import ListaPage      from "./pages/ListaPage";
import InventarioPage from "./pages/InventarioPage";

import ResultItemPage from "./pages/ResultItemPage";   // ← página única

import Navbar from "./components/shared/Navbar";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <Routes>
        {/* público */}
        <Route path="/" element={<HomePage />} />
        <Route path="/busca" element={<ResultItemPage />} />

        {/* protegidos */}
        <Route
          path="/minha-lista"
          element={user ? <ListaPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/inventario"
          element={user ? <InventarioPage /> : <Navigate to="/login" replace />}
        />

        {/* autenticação */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
