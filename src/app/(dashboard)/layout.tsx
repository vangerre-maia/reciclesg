import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const isGestor = session.user.role === "GESTOR";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={isGestor ? "/gestor" : "/associacao"} className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <div>
              <span className="font-bold text-lg">ReciclESG</span>
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {isGestor ? "Gestor" : "Associação"}
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {isGestor ? (
              <>
                <Link href="/gestor" className="text-sm text-blue-200 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/gestor/associacoes" className="text-sm text-blue-200 hover:text-white transition">
                  Associações
                </Link>
              </>
            ) : (
              <>
                <Link href="/associacao" className="text-sm text-blue-200 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/associacao/avaliacoes/nova" className="text-sm text-blue-200 hover:text-white transition">
                  Nova Avaliação
                </Link>
                <Link href="/associacao/historico" className="text-sm text-blue-200 hover:text-white transition">
                  Indicadores
                </Link>
              </>
            )}
            <span className="text-slate-400 text-sm">{session.user.name}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        ReciclESG © {new Date().getFullYear()} — Plataforma de indicadores ESG da coleta seletiva
      </footer>
    </div>
  );
}
