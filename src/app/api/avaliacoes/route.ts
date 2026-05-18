import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcular, EntradaCalculo } from "@/lib/calculos";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.associacaoId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body: EntradaCalculo = await req.json();
  const r = calcular(body);

  const avaliacao = await prisma.avaliacao.create({
    data: {
      associacaoId: session.user.associacaoId,
      dataRef: new Date(body.dataRef),
      modeloCalculo: body.modeloCalculo,
      geracaoPerCapita: body.geracaoPerCapita,
      taxaReciclaveis: body.taxaReciclaveis,
      repasse: body.repasse,
      catadoresTotal: body.catadoresTotal,
      catadoresColeta: body.catadoresColeta,
      salarioMinimo: body.salarioMinimo,
      despesaMensal: body.despesaMensal,
      massaColetada: body.massaColetada,
      massaComercializada: body.massaComercializada,
      // Resultados calculados
      taxaRecuperacao: r.taxaRecuperacao,
      rejeito: r.rejeito,
      receita: r.receita,
      receitaLiquida: r.receitaLiquida,
      produtividadeCatador: r.produtividadeCatador,
      rendaTotalCatador: r.rendaTotalCatador,
      percSalario: r.percSalario,
      impactoClimaticoTotal: r.impactoClimaticoTotal,
      materiais: {
        create: body.materiais.map((m) => ({
          nome: m.nome,
          massa: m.massa,
          precoPorKg: m.precoPorKg,
        })),
      },
      beneficios: {
        create: body.beneficios.map((b) => ({
          nome: b.nome,
          valor: b.valor,
          quantidade: b.quantidade,
        })),
      },
    },
  });

  return NextResponse.json({ id: avaliacao.id, resultado: r });
}
