"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {
  RefreshCcw, Download, FileJson, Printer,
  TrendingUp, TrendingDown, Wallet, Search
} from "lucide-react";

const SHEET_ID = "1ryXnvthakwMC0U-d3mEW_Vlo3IVO465b0n7HimmQptc";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const MONTHS = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (c === '"' && quoted && n === '"') {
      value += '"";
      i++;
    } else if (c === '"') {
      quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (value || row.length) {
        row.push(value.trim());
        rows.push(row);
      }
      row = [];
      value = "";
      if (c === "\r" && n === "\n") i++;
    } else {
      value += c;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  return rows.filter((r) => r.length);
}

function toNumber(v) {
  if (!v) return 0;
  const clean = String(v)
    .replace(/Bs/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  return Number(clean) || 0;
}

function money(n) {
  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function getMonth(row) {
  const text = Object.values(row).join(" ").toUpperCase();
  return MONTHS.find((m) => text.includes(m)) || "SIN MES";
}

function normalizeRows(rows) {
  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());

  return rows.slice(1).map((cells, index) => {
    const raw = {};
    headers.forEach((h, i) => {
      raw[h] = cells[i] || "";
    });

    const tipoRaw = String(raw["ING/EGR"] || raw["CONCEPTO"] || "").toUpperCase();
    const debe = toNumber(raw["DEBE"]);
    const haber = toNumber(raw["HABER"]);

    const tipo = tipoRaw.includes("EGR") ? "EGRESO" : "INGRESO";
    const monto = debe || haber;

    return {
      id: index + 1,
      nro: raw["NROTRAN"] || index + 1,
      mes: getMonth(raw),
      modulo: raw["MODULO"] || "SIN MÓDULO",
      tipo,
      entidad: raw["ENTIDAD"] || "SIN ENTIDAD",
      glosa: raw["GLOSA"] || raw["CONCEPTO"] || "",
      monto,
      raw,
    };
  }).filter((r) => r.monto > 0);
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch(`${CSV_URL}&t=${Date.now()}`);
    const text = await res.text();
    const parsed = normalizeRows(parseCSV(text));
    setData(parsed);
    setUpdated(new Date().toLocaleString("es-BO"));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const q = query.toLowerCase();
      const search =
        r.entidad.toLowerCase().includes(q) ||
        r.glosa.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q);

      const byMonth = month === "TODOS" || r.mes === month;

      return search && byMonth;
    });
  }, [data, query, month]);

  const stats = useMemo(() => {
    const ingresos = filtered
      .filter((r) => r.tipo === "INGRESO")
      .reduce((a, b) => a + b.monto, 0);

    const egresos = filtered
      .filter((r) => r.tipo === "EGRESO")
      .reduce((a, b) => a + b.monto, 0);

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
      transacciones: filtered.length,
    };
  }, [filtered]);

  const monthly = useMemo(() => {
    return MONTHS.map((m) => {
      const rows = filtered.filter((r) => r.mes === m);
      const ingresos = rows.filter((r) => r.tipo === "INGRESO").reduce((a, b) => a + b.monto, 0);
      const egresos = rows.filter((r) => r.tipo === "EGRESO").reduce((a, b) => a + b.monto, 0);

      return {
        mes: m.slice(0, 3),
        ingresos,
        egresos,
        balance: ingresos - egresos,
      };
    }).filter((r) => r.ingresos || r.egresos);
  }, [filtered]);

  const modules = useMemo(() => {
    const acc = {};
    filtered.forEach((r) => {
      acc[r.modulo] = (acc[r.modulo] || 0) + r.monto;
    });

    return Object.entries(acc)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filtered]);

  const topEntity = useMemo(() => {
    const acc = {};
    filtered.forEach((r) => {
      acc[r.entidad] = (acc[r.entidad] || 0) + r.monto;
    });

    return Object.entries(acc).sort((a, b) => b[1] - a[1])[0];
  }, [filtered]);

  function exportCSV() {
    const csv = [
      "Nro,Mes,Modulo,Tipo,Entidad,Glosa,Monto",
      ...filtered.map((r) =>
        `"${r.nro}","${r.mes}","${r.modulo}","${r.tipo}","${r.entidad}","${r.glosa}","${r.monto}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte.csv";
    a.click();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte.json";
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      <div className="flex">
        <aside className="hidden md:block w-72 min-h-screen bg-[#0b1220] border-r border-white/10 p-6">
          <h1 className="text-3xl font-black">Finvista</h1>
          <p className="text-slate-400 mb-10">Analytics Suite</p>

          <nav className="space-y-3">
            <a href="/" className="block bg-blue-600 rounded-xl px-4 py-3 font-bold">
              Resumen
            </a>
            <a href="/analitica" className="block hover:bg-white/10 rounded-xl px-4 py-3">
              Analítica
            </a>
            <a href="/reportes" className="block hover:bg-white/10 rounded-xl px-4 py-3">
              Reportes
            </a>
          </nav>

          <div className="mt-10 rounded-3xl bg-blue-600/20 border border-blue-500/30 p-5">
            <p className="font-bold">Conectado a</p>
            <p className="text-blue-300">Google Sheets</p>
            <p className="text-xs text-slate-400 mt-2">Datos en tiempo real</p>
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-10">
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <div>
              <h2 className="text-4xl font-black">Panel Financiero</h2>
              <p className="text-slate-400">Actualizado {updated || "cargando..."}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-3 flex gap-2 items-center font-bold"
              >
                <RefreshCcw size={18} />
                Actualizar
              </button>

              <button
                onClick={() => {
                  setQuery("");
                  setMonth("TODOS");
                }}
                className="bg-slate-800 rounded-xl px-4 py-3"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-5 mb-8">
            <Card title="Total Ingresos" value={money(stats.ingresos)} icon={<TrendingUp />} green />
            <Card title="Total Egresos" value={`-${money(stats.egresos)}`} icon={<TrendingDown />} red />
            <Card title="Balance Neto" value={money(stats.balance)} icon={<Wallet />} />
            <Card title="Transacciones" value={stats.transacciones.toLocaleString()} icon={<Search />} />
          </div>

          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-5 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar entidad, glosa o tipo..."
                className="bg-[#080d18] border border-white/10 rounded-xl px-4 py-3 outline-none"
              />

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-[#080d18] border border-white/10 rounded-xl px-4 py-3 outline-none"
              >
                <option>TODOS</option>
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid xl:grid-cols-2 gap-6 mb-8">
            <ChartBox title="Ingresos vs Egresos" subtitle="Comparativa mensual">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="ingresos" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="egresos" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Distribución por Módulo" subtitle="Participación del monto total">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modules} dataKey="value" nameKey="name" outerRadius={120}>
                    {modules.map((_, i) => (
                      <Cell
                        key={i}
                        fill={["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Balance Neto Mensual" subtitle="Tendencia ingresos - egresos">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line dataKey="balance" stroke="#3b82f6" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Acumulado de Ingresos" subtitle="Evolución acumulada en el año">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area dataKey="ingresos" stroke="#22c55e" fill="#22c55e33" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 mb-8">
            <h3 className="text-2xl font-black mb-4">Insights Automáticos</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• Margen neto: {stats.ingresos ? ((stats.balance / stats.ingresos) * 100).toFixed(1) : 0}%.</li>
              <li>• Mejor mes en ingresos: {monthly.sort((a, b) => b.ingresos - a.ingresos)[0]?.mes || "N/A"}.</li>
              <li>• Entidad principal: {topEntity?.[0] || "N/A"} concentra {money(topEntity?.[1] || 0)}.</li>
              <li>• Se analizaron {filtered.length.toLocaleString()} transacciones filtradas.</li>
            </ul>
          </div>

          <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6">
            <div className="flex flex-wrap justify-between gap-4 mb-5">
              <h3 className="text-2xl font-black">Transacciones</h3>

              <div className="flex gap-2">
                <button onClick={exportCSV} className="bg-blue-600 px-4 py-2 rounded-xl flex gap-2">
                  <Download size={18} /> CSV
                </button>
                <button onClick={exportJSON} className="bg-purple-600 px-4 py-2 rounded-xl flex gap-2">
                  <FileJson size={18} /> JSON
                </button>
                <button onClick={() => window.print()} className="bg-slate-700 px-4 py-2 rounded-xl flex gap-2">
                  <Printer size={18} /> PDF / Imprimir
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 text-left">Nro</th>
                    <th className="py-3 text-left">Mes</th>
                    <th className="py-3 text-left">Mód</th>
                    <th className="py-3 text-left">Tipo</th>
                    <th className="py-3 text-left">Entidad</th>
                    <th className="py-3 text-left">Glosa</th>
                    <th className="py-3 text-right">Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.slice(0, 80).map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3">{r.nro}</td>
                      <td>{r.mes}</td>
                      <td>{r.modulo}</td>
                      <td className={r.tipo === "INGRESO" ? "text-green-400" : "text-red-400"}>
                        {r.tipo}
                      </td>
                      <td>{r.entidad}</td>
                      <td className="max-w-[400px] truncate">{r.glosa}</td>
                      <td className="text-right font-bold">{money(r.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-slate-400 mt-4">
              {filtered.length.toLocaleString()} registros encontrados
            </p>
          </div>
        </main>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold">Cargando datos...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, green, red }) {
  return (
    <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400">{title}</p>
          <h3 className={`text-3xl font-black mt-3 ${green ? "text-green-400" : red ? "text-red-400" : ""}`}>
            {value}
          </h3>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl">{icon}</div>
      </div>
    </div>
  );
}

function ChartBox({ title, subtitle, children }) {
  return (
    <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="text-slate-400 mb-5">{subtitle}</p>
      <div className="h-80">{children}</div>
    </div>
  );
}