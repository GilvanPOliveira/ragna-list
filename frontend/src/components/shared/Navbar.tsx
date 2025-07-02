import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
  await logout();   // nunca lança, pois já tratamos inside
  nav("/");         // vai para Home
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: enviar `search` para página/rota de resultados
    console.log("buscou:", search);
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-2 flex flex-wrap items-center gap-6">
      {/* Logo */}
      <Link to="/" className="font-bold text-xl mr-4">
        RagnaList
      </Link>

      {/* Campo de busca */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Buscar itens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded px-3 py-1 text-gray-900"
        />
      </form>

      {/* Links principais */}
      <Link to="/minha-lista" className="hover:underline">
        Minha Lista
      </Link>
      <Link to="/inventario" className="hover:underline">
        Inventário
      </Link>

      {/* Login / Usuário */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span>{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white/20 px-3 py-1 rounded hover:bg-white/30"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-white/20 px-3 py-1 rounded hover:bg-white/30"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
