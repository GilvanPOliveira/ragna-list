import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">
        RagnaList
      </Link>
      <div className="space-x-4">
        <span>{user?.email}</span>
        <button
          className="bg-white/20 px-3 py-1 rounded hover:bg-white/30"
          onClick={logout}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
