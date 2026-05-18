"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FATORES_EMISSAO, ResultadoCalculo } from "@/lib/calculos";

type Material = { nome: string; massa: string; precoPorKg: string };
type Beneficio = { nome: string; valor: string; quantidade: string };

const ETAPAS = [
  { num: 1, label: "Identificação", icon: "🧾" },
  { num: 2, label: "Data", icon: "📅" },
  { num: 3, label: "Modelo", icon: "⚙️" },
  { num: 4, label: "Município", icon: "🏙️" },
  { num: 5, label: "Associação", icon: "👥" },
  { num: 6, label: "Totais", icon: "📦" },
  { num: 7, label: "Materiais", icon: "♻️" },
];

const MATERIAIS_SUGERIDOS = Object.keys(FATORES_EMISSAO);

export default function NovaAvaliacaoPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  // Etapa 1
  const [assoc, setAssoc] = useState("");
  const [mun, setMun] = useState("");
  const [pop, setPop] = useState("");
  // Etapa 2
  const [dataRef, setDataRef] = useState("");
  // Etapa 3
  const [modelo, setModelo] = useState<"detalhado" | "simplificado">("detalhado");
  // Etapa 4
  const [geracaoConhecida, setGeracaoConhecida] = useState(false);
  const [geracao, setGeracao] = useState("1.05");
  const [recConhecida, setRecConhecida] = useState(false);
  const [taxaRec, setTaxaRec] = useState("30");
  const [temRepasse, setTemRepasse] = useState(false);
  const [repasse, setRepasse] = useState("0");
  // Etapa 5
  const [catTotal, setCatTotal] = useState("");
  const [catColeta, setCatColeta] = useState("");
  const [salMin, setSalMin] = useState("1518");
  const [despesa, setDespesa] = useState("0");
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  // Etapa 6
  const [massaColetada, setMassaColetada] = useState("");
  // Etapa 7 — materiais; massaComercializada é calculada automaticamente
  const [materiais, setMateriais] = useState<Material[]>([{ nome: "", massa: "", precoPorKg: "" }]);

  // Massa comercializada = soma das massas informadas por material
  const massaComercializada = useMemo(
    () => materiais.reduce((s, m) => s + (Number(m.massa) || 0), 0),
    [materiais]
  );

  function avancar() { if (etapa < 7) setEtapa(etapa + 1); }
  function voltar() { if (etapa > 1) setEtapa(etapa - 1); }

  function addMaterial() {
    setMateriais([...materiais, { nome: "", massa: "", precoPorKg: "" }]);
  }
  function removeMaterial(i: number) {
    setMateriais(materiais.filter((_, idx) => idx !== i));
  }
  function updateMaterial(i: number, field: keyof Material, val: string) {
    const novo = [...materiais];
    novo[i][field] = val;
    setMateriais(novo);
  }

  function addBeneficio() {
    setBeneficios([...beneficios, { nome: "", valor: "", quantidade: "1" }]);
  }
  function removeBeneficio(i: number) {
    setBeneficios(beneficios.filter((_, idx) => idx !== i));
  }
  function updateBeneficio(i: number, field: keyof Beneficio, val: string) {
    const novo = [...beneficios];
    novo[i][field] = val;
    setBeneficios(novo);
  }

  async function calcularESalvar() {
    setSalvando(true);
    try {
      const payload = {
        associacao: assoc,
        municipio: mun,
        populacao: Number(pop),
        dataRef,
        modeloCalculo: modelo,
        geracaoPerCapita: Number(geracao),
        taxaReciclaveis: Number(taxaRec),
        repasse: temRepasse ? Number(repasse) : 0,
        catadoresTotal: Number(catTotal),
        catadoresColeta: Number(catColeta),
        salarioMinimo: Number(salMin),
        despesaMensal: Number(despesa),
        massaColetada: Number(massaColetada),
        massaComercializada,
        materiais: materiais
          .filter((m) => m.nome && m.massa)
          .map((m) => ({ nome: m.nome, massa: Number(m.massa), precoPorKg: Number(m.precoPorKg) })),
        beneficios: beneficios
          .filter((b) => b.nome && b.valor)
          .map((b) => ({ nome: b.nome, valor: Number(b.valor), quantidade: Number(b.quantidade) })),
      };

      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      const data = await res.json();
      setResultado(data.resultado);
    } catch {
      alert("Erro ao calcular/salvar a avaliação.");
    } finally {
      setSalvando(false);
    }
  }

  const pct = Math.round((etapa / 7) * 100);

  return (
    <div>
      {/* Barra de progresso */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-slate-800">Preenchimento da avaliação</span>
          <span className="text-sm text-slate-500">Etapa {etapa} de 7</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {ETAPAS.map((e) => (
            <button
              key={e.num}
              onClick={() => setEtapa(e.num)}
              className={`text-center text-xs py-2 px-1 rounded-xl border transition ${
                etapa === e.num
                  ? "bg-blue-50 border-blue-400 text-blue-700 font-semibold"
                  : e.num < etapa
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              {e.icon}<br />{e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tela principal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

        {/* ===== ETAPA 1 — Identificação ===== */}
        {etapa === 1 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Etapa inicial</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Identificação</h2>
            <p className="text-slate-500 text-sm mb-6">Dados básicos da associação e do município.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Campo label="Associação *" dica="Nome completo da associação">
                <input value={assoc} onChange={(e) => setAssoc(e.target.value)} className={input} placeholder="Nome da associação" />
              </Campo>
              <Campo label="Município *">
                <input value={mun} onChange={(e) => setMun(e.target.value)} className={input} placeholder="Nome do município" />
              </Campo>
              <Campo label="População estimada *" dica="Fonte: IBGE">
                <input type="number" value={pop} onChange={(e) => setPop(e.target.value)} className={input} placeholder="Ex.: 150000" />
              </Campo>
            </div>
          </div>
        )}

        {/* ===== ETAPA 2 — Data ===== */}
        {etapa === 2 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Referência temporal</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Data da avaliação</h2>
            <p className="text-slate-500 text-sm mb-6">Data de referência do levantamento.</p>
            <div className="max-w-xs">
              <Campo label="Data *">
                <input type="date" value={dataRef} onChange={(e) => setDataRef(e.target.value)} className={input} />
              </Campo>
            </div>
          </div>
        )}

        {/* ===== ETAPA 3 — Modelo ===== */}
        {etapa === 3 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Configuração</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Modelo de cálculo</h2>
            <p className="text-slate-500 text-sm mb-6">Selecione o modelo para impactos climáticos. Ambos utilizam fatores de emissão por material (IPCC/ABRELPE).</p>
            <div className="space-y-3">
              {(["detalhado", "simplificado"] as const).map((m) => (
                <label key={m} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${modelo === m ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="modelo" value={m} checked={modelo === m} onChange={() => setModelo(m)} className="mt-0.5" />
                  <div>
                    <div className="font-medium capitalize">{m}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {m === "detalhado"
                        ? "ER = 0,95 × BE — aplica fator de eficiência sobre a emissão evitada por material"
                        : "ER = BE — benefício direto por material, sem fator de eficiência"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ===== ETAPA 4 — Município ===== */}
        {etapa === 4 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Contexto municipal</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Informações municipais</h2>
            <p className="text-slate-500 text-sm mb-6">Parâmetros para estimativa de potencial reciclável.</p>

            <SecaoBloco titulo="📦 Geração de resíduos">
              <RadioSim label="Geração per capita conhecida?" sim={geracaoConhecida} onChange={setGeracaoConhecida} />
              {geracaoConhecida && (
                <Campo label="Valor (kg/hab/dia)">
                  <input type="number" step="any" value={geracao} onChange={(e) => setGeracao(e.target.value)} className={input} placeholder="Ex.: 0.95" />
                </Campo>
              )}
              {!geracaoConhecida && <p className="text-xs text-slate-500 mt-2">Será usado o padrão: <strong>1,05 kg/hab/dia</strong></p>}
            </SecaoBloco>

            <SecaoBloco titulo="♻️ Recicláveis">
              <RadioSim label="Taxa de recicláveis conhecida?" sim={recConhecida} onChange={setRecConhecida} />
              {recConhecida && (
                <Campo label="Valor (%)">
                  <input type="number" step="any" value={taxaRec} onChange={(e) => setTaxaRec(e.target.value)} className={input} placeholder="Ex.: 30" />
                </Campo>
              )}
              {!recConhecida && <p className="text-xs text-slate-500 mt-2">Será usado o padrão: <strong>30%</strong></p>}
            </SecaoBloco>

            <SecaoBloco titulo="🏛️ Apoio público">
              <RadioSim label="Houve repasse público?" sim={temRepasse} onChange={setTemRepasse} />
              {temRepasse && (
                <Campo label="Valor do repasse (R$)">
                  <input type="number" step="any" value={repasse} onChange={(e) => setRepasse(e.target.value)} className={input} placeholder="Ex.: 5000" />
                </Campo>
              )}
            </SecaoBloco>
          </div>
        )}

        {/* ===== ETAPA 5 — Associação ===== */}
        {etapa === 5 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Estrutura da associação</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Informações da associação</h2>
            <p className="text-slate-500 text-sm mb-6">Equipe, despesas e benefícios.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Campo label="Catadores totais *">
                <input type="number" value={catTotal} onChange={(e) => setCatTotal(e.target.value)} className={input} placeholder="Ex.: 18" />
              </Campo>
              <Campo label="Catadores na coleta">
                <input type="number" value={catColeta} onChange={(e) => setCatColeta(e.target.value)} className={input} placeholder="Ex.: 8" />
              </Campo>
              <Campo label="Salário mínimo (R$) *">
                <input type="number" step="any" value={salMin} onChange={(e) => setSalMin(e.target.value)} className={input} />
              </Campo>
              <Campo label="Despesa mensal (R$)">
                <input type="number" step="any" value={despesa} onChange={(e) => setDespesa(e.target.value)} className={input} placeholder="Ex.: 12000" />
              </Campo>
            </div>

            <SecaoBloco titulo="🎁 Benefícios recebidos">
              {beneficios.length > 0 && (
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-left">
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Valor (R$)</th>
                      <th className="px-3 py-2">Qtd</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficios.map((b, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1"><input value={b.nome} onChange={(e) => updateBeneficio(i, "nome", e.target.value)} className={inputSm} placeholder="Ex.: Bolsa família" /></td>
                        <td className="px-2 py-1"><input type="number" value={b.valor} onChange={(e) => updateBeneficio(i, "valor", e.target.value)} className={inputSm} /></td>
                        <td className="px-2 py-1"><input type="number" value={b.quantidade} onChange={(e) => updateBeneficio(i, "quantidade", e.target.value)} className={inputSm} /></td>
                        <td className="px-2 py-1"><button onClick={() => removeBeneficio(i)} className="text-red-500 hover:text-red-700 text-xs">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button onClick={addBeneficio} className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition">
                + Adicionar benefício
              </button>
            </SecaoBloco>
          </div>
        )}

        {/* ===== ETAPA 6 — Totais ===== */}
        {etapa === 6 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Volumes do período</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Totais coletados</h2>
            <p className="text-slate-500 text-sm mb-6">
              Informe a massa total coletada no período. O total comercializado será calculado automaticamente a partir dos materiais detalhados na próxima etapa.
            </p>
            <div className="max-w-sm">
              <Campo label="Massa coletada (kg) *" dica="Total de resíduos recolhidos no período, incluindo rejeitos">
                <input
                  type="number"
                  step="any"
                  value={massaColetada}
                  onChange={(e) => setMassaColetada(e.target.value)}
                  className={input}
                  placeholder="Ex.: 20000"
                />
              </Campo>
            </div>
            {massaComercializada > 0 && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                Massa comercializada (calculada dos materiais): <strong>{massaComercializada.toLocaleString("pt-BR")} kg</strong>
              </div>
            )}
          </div>
        )}

        {/* ===== ETAPA 7 — Materiais ===== */}
        {etapa === 7 && (
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Detalhamento por material</span>
            <h2 className="text-2xl font-bold mt-3 mb-1">Materiais comercializados</h2>
            <p className="text-slate-500 text-sm mb-6">
              Registre cada material, sua massa comercializada (kg) e o preço de venda/kg. A soma das massas será o total comercializado.
            </p>

            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-3 py-2">Material</th>
                  <th className="px-3 py-2">Massa comerc. (kg)</th>
                  <th className="px-3 py-2">Preço/kg (R$)</th>
                  <th className="px-3 py-2">Fator GEE (tCO₂e/t)</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {materiais.map((m, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-2 py-1">
                      <select value={m.nome} onChange={(e) => updateMaterial(i, "nome", e.target.value)} className={inputSm}>
                        <option value="">Selecione...</option>
                        {MATERIAIS_SUGERIDOS.map((n) => <option key={n} value={n}>{n}</option>)}
                        <option value="Outros">Outros</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" step="any" value={m.massa} onChange={(e) => updateMaterial(i, "massa", e.target.value)} className={inputSm} placeholder="kg" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" step="any" value={m.precoPorKg} onChange={(e) => updateMaterial(i, "precoPorKg", e.target.value)} className={inputSm} placeholder="R$" />
                    </td>
                    <td className="px-2 py-1 text-slate-500 text-center">
                      {m.nome ? (FATORES_EMISSAO[m.nome] ?? 0.5).toFixed(2) : "—"}
                    </td>
                    <td className="px-2 py-1">
                      {materiais.length > 1 && <button onClick={() => removeMaterial(i)} className="text-red-500 hover:text-red-700 text-xs">✕</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-700">
                  <td className="px-3 py-2">Total comercializado</td>
                  <td className="px-3 py-2">{massaComercializada.toLocaleString("pt-BR")} kg</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>

            <button onClick={addMaterial} className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition mb-6">
              + Adicionar material
            </button>

            {!resultado && (
              <div className="mt-4">
                <button
                  onClick={calcularESalvar}
                  disabled={salvando}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition disabled:opacity-60"
                >
                  {salvando ? "Calculando..." : "📊 Calcular e Salvar"}
                </button>
              </div>
            )}

            {resultado && <PainelResultados r={resultado} />}

            {resultado && (
              <div className="mt-6 flex gap-3 flex-wrap">
                <button onClick={() => router.push("/associacao")} className="bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition">
                  ✅ Voltar ao painel
                </button>
                <button onClick={() => { setResultado(null); setEtapa(1); }} className="bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-300 transition">
                  🔄 Nova avaliação
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navegação entre etapas */}
        {!resultado && (
          <div className="flex justify-between mt-8">
            <button onClick={voltar} disabled={etapa === 1} className="bg-slate-100 text-slate-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition disabled:opacity-30">
              ← Voltar
            </button>
            {etapa < 7 && (
              <button onClick={avancar} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition">
                Próximo ➜
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Componentes auxiliares ----

const input = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-slate-50";
const inputSm = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition bg-slate-50";

function Campo({ label, dica, children }: { label: string; dica?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {dica && <span className="ml-1 text-slate-400 text-xs" title={dica}>(?)</span>}
      </label>
      {children}
    </div>
  );
}

function SecaoBloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
      <h4 className="font-semibold text-slate-800 mb-4">{titulo}</h4>
      {children}
    </div>
  );
}

function RadioSim({ label, sim, onChange }: { label: string; sim: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div className="flex gap-3">
        {[{ val: true, lbl: "Sim" }, { val: false, lbl: "Não" }].map(({ val, lbl }) => (
          <label key={String(val)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm transition ${sim === val ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
            <input type="radio" checked={sim === val} onChange={() => onChange(val)} className="sr-only" />
            {lbl}
          </label>
        ))}
      </div>
    </div>
  );
}

function PainelResultados({ r }: { r: ResultadoCalculo }) {
  const fmt = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
  const fmtBR = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm font-medium text-emerald-800">Avaliação salva com sucesso! ✅</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Metrica titulo="🌿 Ambiental" itens={[
          ["Potencial reciclável", fmtBR(Math.round(r.potencialReciclavel)) + " kg/mês"],
          ["Taxa de recuperação", fmt(r.taxaRecuperacao) + "%"],
          ["Gap para meta 4%", fmt(r.gapRecuperacao) + " p.p."],
          ["Taxa de rejeito", fmt(r.rejeito) + "%"],
          ["Kg/habitante/mês", fmt(r.kgPerCapita, 4)],
          ["Status", r.status],
        ]} />
        <Metrica titulo="💰 Econômico" itens={[
          ["Receita bruta", "R$ " + fmt(r.receita)],
          ["Receita líquida", "R$ " + fmt(r.receitaLiquida)],
          ["Valor/tonelada", "R$ " + fmt(r.valorPorTonelada) + "/t"],
          ["Depend. apoio público", fmt(r.dependenciaApoioPublico) + "%"],
        ]} />
        <Metrica titulo="👥 Social" itens={[
          ["Produtividade", fmt(r.produtividadeCatador) + " kg/catador"],
          ["Renda por catador", "R$ " + fmt(r.rendaTotalCatador)],
          ["% salário mínimo", fmt(r.percSalario) + "%"],
        ]} />
        <Metrica titulo="🌍 Climático" itens={[
          ["Modelo", r.modeloCalculo],
          ["CO₂e evitado", fmt(r.impactoClimaticoTotal, 4) + " tCO₂e"],
        ]} />
        {Object.keys(r.materiaisMap).length > 0 && (
          <Metrica titulo="♻️ Por material (kg)" itens={
            Object.entries(r.materiaisMap).map(([k, v]) => [k, fmtBR(v) + " kg"])
          } />
        )}
      </div>
    </div>
  );
}

function Metrica({ titulo, itens }: { titulo: string; itens: [string, string | number][] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h4 className="font-semibold text-slate-800 mb-3">{titulo}</h4>
      {itens.map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">{k}</span>
          <span className="font-medium text-slate-800 text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}
