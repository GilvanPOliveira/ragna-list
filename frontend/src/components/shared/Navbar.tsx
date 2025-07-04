import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    /* numérico → mesma página resultados c/ id */
    const param = /^\d+$/.test(term)
      ? `id=${term}`
      : `q=${encodeURIComponent(term)}`;
    navigate(`/busca?${param}`);
    setQuery("");
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-2 flex flex-wrap items-center gap-5">
      <Link to="/" className="font-bold text-xl mr-4">
        RagnaList
      </Link>

      <form onSubmit={submitSearch} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar itens..."
          className="rounded px-3 py-1 text-gray-900 w-60"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-white/20 px-3 py-1 rounded hover:bg-white/30"
        >
          Buscar
        </button>
      </form>

      <Link to="/minha-lista" className="hover:underline">
        Minha Lista
      </Link>
      <Link to="/inventario" className="hover:underline">
        Inventário
      </Link>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span>{user.email}</span>
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
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
