import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GraficosHistorico } from "./GraficosHistorico";

export default async function HistoricoPage() {
  const session = await auth();
  if (!session?.user.associacaoId) redirect("/login");

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { associacaoId: session.user.associacaoId },
    orderBy: { dataRef: "asc" },
  });

  const pontos = avaliacoes.map((a) => ({
    data: new Date(a.dataRef).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    taxaRecuperacao: Number((a.taxaRecuperacao ?? 0).toFixed(2)),
    co2e: Number((a.impactoClimaticoTotal ?? 0).toFixed(4)),
    receita: Number((a.receita ?? 0).toFixed(2)),
    rendaCatador: Number((a.rendaTotalCatador ?? 0).toFixed(2)),
    produtividade: Number((a.produtividadeCatador ?? 0).toFixed(2)),
    rejeito: Number((a.rejeito ?? 0).toFixed(2)),
    kgComercializado: a.massaComercializada ?? 0,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Evolução dos indicadores</h1>
        <p className="text-slate-500 mt-1">Acompanhamento temporal de todos os dados registrados nas avaliações.</p>
      </div>

      {avaliacoes.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="px-4 py-3">Data ref.</th>
                <th className="px-4 py-3">Kg coletados</th>
                <th className="px-4 py-3">Kg comercializados</th>
                <th className="px-4 py-3">Taxa recup. (%)</th>
                <th className="px-4 py-3">Rejeito (%)</th>
                <th className="px-4 py-3">CO₂e (t)</th>
                <th className="px-4 py-3">Receita (R$)</th>
                <th className="px-4 py-3">Renda/catador (R$)</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{new Date(a.dataRef).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-2">{(a.massaColetada ?? 0).toLocaleString("pt-BR")} kg</td>
                  <td className="px-4 py-2">{(a.massaComercializada ?? 0).toLocaleString("pt-BR")} kg</td>
                  <td className="px-4 py-2">{(a.taxaRecuperacao ?? 0).toFixed(2)}%</td>
                  <td className="px-4 py-2">{(a.rejeito ?? 0).toFixed(2)}%</td>
                  <td className="px-4 py-2">{(a.impactoClimaticoTotal ?? 0).toFixed(4)}</td>
                  <td className="px-4 py-2">R$ {(a.receita ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2">R$ {(a.rendaTotalCatador ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GraficosHistorico pontos={pontos} />
    </div>
  );
}
