"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    const res = await signIn("credentials", { email, password, redirect: false });

    setCarregando(false);

    if (res?.error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">♻️</div>
          <h1 className="text-3xl font-bold text-white">ReciclESG</h1>
          <p className="text-blue-200 mt-2 text-sm">
            Plataforma de avaliação ESG da coleta seletiva
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 rounded-xl hover:brightness-110 active:scale-95 transition disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
