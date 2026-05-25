"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  RefreshCcw,
  Download,
  FileJson,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
} from "lucide-react";

const SHEET_ID =
  "1ryXnvthakwMC0U-d3mEW_Vlo3IVO465b0n7HimmQptc";

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
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
      value += '"';
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

  return (
    MONTHS.find((m) => text.includes(m)) || "SIN MES"
  );
}

function normalizeRows(rows) {
  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());

  return rows
    .slice(1)
    .map((cells, index) => {
      const raw = {};

      headers.forEach((h, i) => {
        raw[h] = cells[i] || "";
      });

      const tipoRaw = String(
        raw["ING/EGR"] || raw["CONCEPTO"] || ""
      ).toUpperCase();

      const debe = toNumber(raw["DEBE"]);
      const haber = toNumber(raw["HABER"]);

      const tipo = tipoRaw.includes("EGR")
        ? "EGRESO"
        : "INGRESO";

      const monto = debe || haber;

      return {
        id: index + 1,
        nro: raw["NROTRAN"] || index + 1,
        mes: getMonth(raw),
        modulo: raw["MODULO"] || "SIN MODULO",
        tipo,
        entidad: raw["ENTIDAD"] || "SIN ENTIDAD",
        glosa:
          raw["GLOSA"] || raw["CONCEPTO"] || "",
        monto,
      };
    })
    .filter((r) => r.monto > 0);
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch(
        `${CSV_URL}&t=${Date.now()}`
      );

      const text = await res.text();

      const parsed = normalizeRows(parseCSV(text));

      setData(parsed);

      setUpdated(
        new Date().toLocaleString("es-BO")
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      const byMonth =
        month === "TODOS" || r.mes === month;

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
      const rows = filtered.filter(
        (r) => r.mes === m
      );

      const ingresos = rows
        .filter((r) => r.tipo === "INGRESO")
        .reduce((a, b) => a + b.monto, 0);

      const egresos = rows
        .filter((r) => r.tipo === "EGRESO")
        .reduce((a, b) => a + b.monto, 0);

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
      acc[r.modulo] =
        (acc[r.modulo] || 0) + r.monto;
    });

    return Object.entries(acc)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filtered]);

  function exportCSV() {
    const csv = [
      "Nro,Mes,Modulo,Tipo,Entidad,Glosa,Monto",
      ...filtered.map(
        (r) =>
          `"${r.nro}","${r.mes}","${r.modulo}","${r.tipo}","${r.entidad}","${r.glosa}","${r.monto}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "reporte.csv";
    a.click();
  }

  function exportJSON() {
    const blob = new Blob(
      [JSON.stringify(filtered, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "reporte.json";
    a.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#170000] via-[#0b0202] to-[#260000] text-white">
      <main className="p-5 md:p-10">
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-black">
              Balance Empresarial
            </h1>

            <p className="text-slate-300 mt-2">
              Actualizado {updated}
            </p>

            <p className="text-red-400 mt-1">
              Sistema Inteligente de Análisis Financiero
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="bg-red-700 hover:bg-red-600 px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/40"
            >
              <RefreshCcw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <Card
            title="Ingresos"
            value={`Bs ${money(stats.ingresos)}`}
            green
            icon={<TrendingUp />}
          />

          <Card
            title="Egresos"
            value={`Bs ${money(stats.egresos)}`}
            red
            icon={<TrendingDown />}
          />

          <Card
            title="Balance"
            value={`Bs ${money(stats.balance)}`}
            icon={<Wallet />}
          />

          <Card
            title="Transacciones"
            value={stats.transacciones}
            icon={<Search />}
          />
        </div>

        <div className="bg-gradient-to-br from-[#2a0505] to-[#120202] border border-red-500/20 rounded-3xl p-5 mb-8 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-red-600/20">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Buscar..."
              className="bg-[#160303] border border-red-500/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition"
            />

            <select
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
              className="bg-[#160303] border border-red-500/20 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              <option>TODOS</option>

              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-6 mb-8">
          <ChartBox title="Ingresos vs Egresos">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f0d0d"
                />

                <XAxis
                  dataKey="mes"
                  stroke="#fca5a5"
                />

                <YAxis stroke="#fca5a5" />

                <Tooltip />

                <Bar
                  dataKey="ingresos"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="egresos"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Balance Mensual">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f0d0d"
                />

                <XAxis
                  dataKey="mes"
                  stroke="#fca5a5"
                />

                <YAxis stroke="#fca5a5" />

                <Tooltip />

                <Line
                  dataKey="balance"
                  stroke="#f87171"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Distribución">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={modules}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                >
                  {modules.map((_, i) => (
                    <Cell
                      key={i}
                      fill={[
                        "#dc2626",
                        "#ef4444",
                        "#f87171",
                        "#991b1b",
                        "#7f1d1d",
                        "#450a0a",
                      ][i]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Ingresos Acumulados">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3f0d0d"
                />

                <XAxis
                  dataKey="mes"
                  stroke="#fca5a5"
                />

                <YAxis stroke="#fca5a5" />

                <Tooltip />

                <Area
                  dataKey="ingresos"
                  stroke="#ef4444"
                  fill="#ef444433"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        <div className="bg-gradient-to-br from-[#2a0505] to-[#120202] border border-red-500/20 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-red-600/30">
          <div className="flex flex-wrap justify-between gap-4 mb-5">
            <h2 className="text-3xl font-black">
              Transacciones
            </h2>

            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-xl flex gap-2 transition-all duration-300 hover:scale-105"
              >
                <Download size={18} />
                CSV
              </button>

              <button
                onClick={exportJSON}
                className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded-xl flex gap-2 transition-all duration-300 hover:scale-105"
              >
                <FileJson size={18} />
                JSON
              </button>

              <button
                onClick={() => window.print()}
                className="bg-[#3f0d0d] hover:bg-[#5b1111] px-4 py-2 rounded-xl flex gap-2 transition-all duration-300 hover:scale-105"
              >
                <Printer size={18} />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-500/20 text-red-200">
                  <th className="py-3 text-left">
                    Nro
                  </th>

                  <th className="py-3 text-left">
                    Mes
                  </th>

                  <th className="py-3 text-left">
                    Módulo
                  </th>

                  <th className="py-3 text-left">
                    Tipo
                  </th>

                  <th className="py-3 text-left">
                    Entidad
                  </th>

                  <th className="py-3 text-left">
                    Glosa
                  </th>

                  <th className="py-3 text-right">
                    Monto
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered
                  .slice(0, 80)
                  .map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-red-500/10 hover:bg-red-900/10 transition"
                    >
                      <td className="py-3">
                        {r.nro}
                      </td>

                      <td>{r.mes}</td>

                      <td>{r.modulo}</td>

                      <td
                        className={
                          r.tipo === "INGRESO"
                            ? "text-green-400 font-bold"
                            : "text-red-400 font-bold"
                        }
                      >
                        {r.tipo}
                      </td>

                      <td>{r.entidad}</td>

                      <td>{r.glosa}</td>

                      <td className="text-right font-bold">
                        Bs {money(r.monto)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  green,
  red,
}) {
  return (
    <div className="bg-gradient-to-br from-[#2a0505] to-[#120202] border border-red-500/20 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-600/30">
      <div className="flex justify-between">
        <div>
          <p className="text-red-200">
            {title}
          </p>

          <h3
            className={`text-3xl font-black mt-3 ${
              green
                ? "text-green-400"
                : red
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {value}
          </h3>
        </div>

        <div className="bg-red-900/30 p-3 rounded-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-[#2a0505] to-[#120202] border border-red-500/20 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20">
      <h3 className="text-2xl font-black mb-5">
        {title}
      </h3>

      <div className="h-80">
        {children}
      </div>
    </div>
  );
}