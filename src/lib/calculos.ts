// Fatores de emissão evitada por material (tCO2e/t) — IPCC/ABRELPE
export const FATORES_EMISSAO: Record<string, number> = {
  Papel: 1.1,           // papel de escritório/jornal/branco
  Papelão: 0.9,         // papelão ondulado/caixas
  Plástico: 1.5,
  Vidro: 0.3,
  Metal: 2.0,
  Alumínio: 9.1,
  Cobre: 4.0,
  "Papel Misto": 0.8,
  "Plástico Misto": 1.2,
  Outros: 0.5,
};

export interface Material {
  nome: string;
  massa: number; // kg
  precoPorKg: number;
}

export interface Beneficio {
  nome: string;
  valor: number;
  quantidade: number;
}

export interface EntradaCalculo {
  associacao: string;
  municipio: string;
  populacao: number;
  dataRef: string;
  modeloCalculo: "detalhado" | "simplificado";
  geracaoPerCapita: number;
  taxaReciclaveis: number;
  repasse: number;
  catadoresTotal: number;
  catadoresColeta: number;
  salarioMinimo: number;
  despesaMensal: number;
  massaColetada: number;
  massaComercializada: number;
  materiais: Material[];
  beneficios: Beneficio[];
}

export interface ResultadoCalculo {
  // Ambiental
  potencialReciclavel: number;
  taxaRecuperacao: number;
  gapRecuperacao: number;
  kgAdicionaisNecessarios: number;
  rejeito: number;
  kgPerCapita: number;
  status: string;

  // Econômico
  receita: number;
  totalBeneficios: number;
  receitaLiquida: number;
  valorPorTonelada: number;
  dependenciaApoioPublico: number;

  // Social
  produtividadeCatador: number;
  rendaTotalCatador: number;
  percSalario: number;

  // Climático
  impactoClimaticoTotal: number;
  modeloCalculo: string;

  // Detalhes por material
  materiaisMap: Record<string, number>;
}

export function calcular(entrada: EntradaCalculo): ResultadoCalculo {
  const {
    populacao,
    geracaoPerCapita,
    taxaReciclaveis,
    repasse,
    catadoresTotal,
    catadoresColeta,
    salarioMinimo,
    despesaMensal,
    massaColetada,
    massaComercializada,
    materiais,
    beneficios,
    modeloCalculo,
  } = entrada;

  // Potencial reciclável municipal (kg/mês)
  const potencialReciclavel = populacao * geracaoPerCapita * 30 * (taxaReciclaveis / 100);

  // Taxa de recuperação = comercializado / potencial
  const taxaRecuperacao = potencialReciclavel > 0
    ? (massaComercializada / potencialReciclavel) * 100
    : 0;

  // Gap para meta 4% (SNIS)
  const metaPerc = 4;
  const gapRecuperacao = Math.max(0, metaPerc - taxaRecuperacao);
  const kgAdicionaisNecessarios = (gapRecuperacao / 100) * potencialReciclavel;

  // Rejeito
  const rejeito = massaColetada > 0
    ? ((massaColetada - massaComercializada) / massaColetada) * 100
    : 0;

  // Kg per capita/mês
  const kgPerCapita = populacao > 0 ? massaComercializada / populacao : 0;

  const status = taxaRecuperacao >= metaPerc ? "✅ Meta atingida" : "⚠️ Abaixo da meta";

  // Econômico
  const receita = materiais.reduce((s, m) => s + m.massa * m.precoPorKg, 0);
  const totalBeneficios = beneficios.reduce((s, b) => s + b.valor * b.quantidade, 0);
  const receitaLiquida = receita + repasse - despesaMensal + totalBeneficios;
  const valorPorTonelada = massaComercializada > 0 ? (receita / massaComercializada) * 1000 : 0;
  const dependenciaApoioPublico = (receita + repasse) > 0
    ? (repasse / (receita + repasse)) * 100
    : 0;

  // Social
  const catAtivos = catadoresColeta > 0 ? catadoresColeta : catadoresTotal;
  const produtividadeCatador = catAtivos > 0 ? massaComercializada / catAtivos : 0;
  const rendaTotalCatador = catAtivos > 0 ? receitaLiquida / catAtivos : 0;
  const percSalario = salarioMinimo > 0 ? (rendaTotalCatador / salarioMinimo) * 100 : 0;

  // Climático
  const materiaisMap: Record<string, number> = {};
  materiais.forEach((m) => {
    materiaisMap[m.nome] = (materiaisMap[m.nome] ?? 0) + m.massa;
  });

  let impactoClimaticoTotal = 0;

  // Ambos os modelos usam fatores por material (IPCC/ABRELPE)
  // Detalhado: ER = 0,95 × BE (desconta perdas no processo)
  // Simplificado: ER = BE (benefício direto, sem fator de eficiência)
  Object.entries(materiaisMap).forEach(([nome, massa]) => {
    const fator = FATORES_EMISSAO[nome] ?? 0.5;
    const be = (massa / 1000) * fator;
    impactoClimaticoTotal += modeloCalculo === "detalhado" ? 0.95 * be : be;
  });

  return {
    potencialReciclavel,
    taxaRecuperacao,
    gapRecuperacao,
    kgAdicionaisNecessarios,
    rejeito,
    kgPerCapita,
    status,
    receita,
    totalBeneficios,
    receitaLiquida,
    valorPorTonelada,
    dependenciaApoioPublico,
    produtividadeCatador,
    rendaTotalCatador,
    percSalario,
    impactoClimaticoTotal,
    modeloCalculo: modeloCalculo === "detalhado" ? "Detalhado (ER = 0,95×BE)" : "Simplificado (ER = BE por material)",
    materiaisMap,
  };
}
