"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type Ponto = {
  data: string;
  taxaRecuperacao: number;
  co2e: number;
  receita: number;
  rendaCatador: number;
  produtividade: number;
  rejeito: number;
  kgComercializado: number;
};

export function GraficosHistorico({ pontos }: { pontos: Ponto[] }) {
  if (pontos.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-12">Nenhuma avaliação registrada ainda.</p>;
  }

  const fmt = (v: unknown) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return (
    <div className="space-y-8">
      <Grafico titulo="🌿 Taxa de recuperação (%)" cor="#10b981">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={pontos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="data" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => fmt(v) + "%"} />
            <Line type="monotone" dataKey="taxaRecuperacao" name="Taxa recup." stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Grafico>

      <Grafico titulo="🌍 CO₂e evitado (tCO₂e)" cor="#3b82f6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pontos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="data" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmt(v) + " tCO₂e"} />
            <Bar dataKey="co2e" name="CO₂e evitado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Grafico>

      <Grafico titulo="💰 Receita bruta (R$)" cor="#f59e0b">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={pontos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="data" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => "R$ " + fmt(v)} />
            <Line type="monotone" dataKey="receita" name="Receita" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Grafico>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Grafico titulo="👥 Renda por catador (R$)" cor="#8b5cf6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pontos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => "R$ " + fmt(v)} />
              <Line type="monotone" dataKey="rendaCatador" name="Renda/catador" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Grafico>

        <Grafico titulo="⚡ Produtividade (kg/catador)" cor="#06b6d4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pontos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmt(v) + " kg"} />
              <Line type="monotone" dataKey="produtividade" name="Produtividade" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Grafico>

        <Grafico titulo="🗑️ Taxa de rejeito (%)" cor="#ef4444">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pontos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={(v) => fmt(v) + "%"} />
              <Line type="monotone" dataKey="rejeito" name="Rejeito" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Grafico>

        <Grafico titulo="♻️ Kg comercializados" cor="#22c55e">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pontos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmt(v) + " kg"} />
              <Bar dataKey="kgComercializado" name="Comercializado" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Grafico>
      </div>
    </div>
  );
}

function Grafico({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4" style={{ color: cor }}>{titulo}</h3>
      {children}
    </div>
  );
}
