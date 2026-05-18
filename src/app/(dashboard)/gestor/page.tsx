import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GestorPage() {
  const session = await auth();

  const [totalAssociacoes, totalAvaliacoes, avaliacoesRecentes] = await Promise.all([
    prisma.associacao.count(),
    prisma.avaliacao.count(),
    prisma.avaliacao.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { associacao: true },
    }),
  ]);

  const kgTotal = await prisma.avaliacao.aggregate({
    _sum: { massaComercializada: true },
  });

  const co2Total = await prisma.avaliacao.aggregate({
    _sum: { impactoClimaticoTotal: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bom dia, {session?.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 mt-1">Visão consolidada de todas as associações</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Associações" value={totalAssociacoes.toString()} icon="🏢" cor="blue" />
        <KpiCard label="Avaliações" value={totalAvaliacoes.toString()} icon="📋" cor="green" />
        <KpiCard
          label="Kg Comercializados"
          value={((kgTotal._sum.massaComercializada ?? 0) / 1000).toFixed(1) + " t"}
          icon="♻️"
          cor="emerald"
        />
        <KpiCard
          label="CO₂e evitado"
          value={(co2Total._sum.impactoClimaticoTotal ?? 0).toFixed(1) + " t"}
          icon="🌍"
          cor="sky"
        />
      </div>

      {/* Avaliações recentes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Avaliações recentes</h2>
          <Link href="/gestor/associacoes" className="text-sm text-blue-600 hover:underline">
            Ver todas as associações →
          </Link>
        </div>

        {avaliacoesRecentes.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            Nenhuma avaliação registrada ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="px-6 py-3 font-medium">Associação</th>
                <th className="px-6 py-3 font-medium">Município</th>
                <th className="px-6 py-3 font-medium">Data ref.</th>
                <th className="px-6 py-3 font-medium">Kg comercializados</th>
                <th className="px-6 py-3 font-medium">CO₂e (t)</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoesRecentes.map((av) => (
                <tr key={av.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{av.associacao.nome}</td>
                  <td className="px-6 py-3 text-slate-600">{av.associacao.municipio}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {new Date(av.dataRef).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {av.massaComercializada.toLocaleString("pt-BR")} kg
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {(av.impactoClimaticoTotal ?? 0).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon, cor,
}: {
  label: string; value: string; icon: string; cor: string;
}) {
  const cores: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    emerald: "bg-emerald-50 border-emerald-100",
    sky: "bg-sky-50 border-sky-100",
  };
  return (
    <div className={`rounded-2xl border p-5 ${cores[cor] ?? "bg-slate-50 border-slate-100"}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
