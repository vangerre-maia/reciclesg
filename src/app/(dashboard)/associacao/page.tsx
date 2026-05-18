import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AssociacaoPage() {
  const session = await auth();
  if (!session?.user.associacaoId) redirect("/login");

  const associacao = await prisma.associacao.findUnique({
    where: { id: session.user.associacaoId },
    include: {
      avaliacoes: {
        orderBy: { dataRef: "desc" },
        take: 12,
      },
    },
  });

  if (!associacao) redirect("/login");

  const kgTotal = associacao.avaliacoes.reduce((s, a) => s + a.massaComercializada, 0);
  const co2Total = associacao.avaliacoes.reduce((s, a) => s + (a.impactoClimaticoTotal ?? 0), 0);
  const ultimaAv = associacao.avaliacoes[0];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{associacao.nome}</h1>
          <p className="text-slate-500 mt-1">
            {associacao.municipio} · {associacao.populacao?.toLocaleString("pt-BR") ?? "—"} hab.
          </p>
        </div>
        <Link
          href="/associacao/avaliacoes/nova"
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition"
        >
          + Nova Avaliação
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Avaliações" value={associacao.avaliacoes.length.toString()} icon="📋" />
        <KpiCard label="Kg comercializados" value={(kgTotal / 1000).toFixed(2) + " t"} icon="♻️" />
        <KpiCard label="CO₂e evitado" value={co2Total.toFixed(2) + " t"} icon="🌍" />
        <KpiCard
          label="Última avaliação"
          value={ultimaAv ? new Date(ultimaAv.dataRef).toLocaleDateString("pt-BR") : "—"}
          icon="📅"
        />
      </div>

      {/* Histórico */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Histórico de avaliações</h2>
        </div>

        {associacao.avaliacoes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 mb-4">Nenhuma avaliação registrada ainda.</p>
            <Link
              href="/associacao/avaliacoes/nova"
              className="inline-block bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition"
            >
              Criar primeira avaliação
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="px-6 py-3 font-medium">Data ref.</th>
                <th className="px-6 py-3 font-medium">Modelo</th>
                <th className="px-6 py-3 font-medium">Kg coletados</th>
                <th className="px-6 py-3 font-medium">Kg comercializados</th>
                <th className="px-6 py-3 font-medium">Taxa recup. (%)</th>
                <th className="px-6 py-3 font-medium">CO₂e (t)</th>
              </tr>
            </thead>
            <tbody>
              {associacao.avaliacoes.map((av) => (
                <tr key={av.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">
                    {new Date(av.dataRef).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-3 capitalize text-slate-600">{av.modeloCalculo}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {av.massaColetada.toLocaleString("pt-BR")} kg
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {av.massaComercializada.toLocaleString("pt-BR")} kg
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {(av.taxaRecuperacao ?? 0).toFixed(2)}%
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

function KpiCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
