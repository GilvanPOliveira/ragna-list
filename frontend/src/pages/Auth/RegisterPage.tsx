import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);   // opcional

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      setMsg("Conta criada! Faça login.");
      nav("/login");                               // ⇦ redireciona pro login
    } catch (err: any) {
      setMsg(err.response?.data?.msg || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded shadow w-80 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Cadastro</h1>
        {msg && <p className="text-sm text-center">{msg}</p>}
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
        <p className="text-center text-sm">
          Já possui conta?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
