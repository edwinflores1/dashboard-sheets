"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  Moon,
  Sun,
  RefreshCcw,
  Download,
} from "lucide-react";

const SHEET_ID =
  "1ryXnvthakwMC0U-d3mEW_Vlo3IVO465b0n7HimmQptc";

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

function parseCSV(text) {
  const lines = text.split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");

    let obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i];
    });

    return obj;
  });
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch(CSV_URL);
      const text = await res.text();

      const parsed = parseCSV(text);

      setData(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalRegistros = data.length;

  const totalMonto = useMemo(() => {
    return data.reduce((acc, item) => {
      const num = Number(item.DEBE || 0);
      return acc + num;
    }, 0);
  }, [data]);

  const chartData = useMemo(() => {
    return data.slice(0, 10).map((item, i) => ({
      name: item.ENTIDAD || `Item ${i + 1}`,
      monto: Number(item.DEBE || 0),
    }));
  }, [data]);

  return (
    <div
      className={
        dark
          ? "dark bg-slate-950 text-white min-h-screen"
          : "bg-slate-100 text-black min-h-screen"
      }
    >
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 min-h-screen p-6 hidden md:block">
          <h1 className="text-3xl font-black mb-10">
            Dashboard Pro
          </h1>

          <div className="space-y-4">
            <button className="w-full bg-blue-600 rounded-xl p-3 text-left font-bold">
              Dashboard
            </button>

            <button className="w-full hover:bg-slate-800 rounded-xl p-3 text-left">
              Reportes
            </button>

            <button className="w-full hover:bg-slate-800 rounded-xl p-3 text-left">
              Analítica
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6">
          {/* HEADER */}
          <div className="flex flex-wrap justify-between gap-4 mb-6">
            <div>
              <h2 className="text-4xl font-black">
                Dashboard Empresarial
              </h2>

              <p className="opacity-70">
                Google Sheets Analytics
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-3 flex items-center gap-2 font-bold"
              >
                <RefreshCcw size={18} />
                Actualizar
              </button>

              <button
                onClick={() => setDark(!dark)}
                className="bg-slate-800 rounded-xl px-4 py-3"
              >
                {dark ? <Sun /> : <Moon />}
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
              <p className="opacity-70">Total registros</p>

              <h3 className="text-4xl font-black mt-3">
                {totalRegistros}
              </h3>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
              <p className="opacity-70">Monto total</p>

              <h3 className="text-4xl font-black mt-3">
                Bs {totalMonto.toLocaleString()}
              </h3>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
              <p className="opacity-70">Estado</p>

              <h3 className="text-4xl font-black mt-3 text-green-400">
                ONLINE
              </h3>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900 rounded-3xl p-6">
              <h3 className="text-2xl font-black mb-6">
                Gráfico de Barras
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="monto" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6">
              <h3 className="text-2xl font-black mb-6">
                Tendencias
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="monto"
                      stroke="#22c55e"
                      strokeWidth={4}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PIE */}
          <div className="bg-slate-900 rounded-3xl p-6 mb-8">
            <h3 className="text-2xl font-black mb-6">
              Distribución
            </h3>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="monto"
                    nameKey="name"
                    outerRadius={150}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={[
                          "#3b82f6",
                          "#22c55e",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                        ][index % 5]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-slate-900 rounded-3xl p-6 overflow-auto">
            <div className="flex justify-between mb-5">
              <h3 className="text-2xl font-black">
                Tabla de Datos
              </h3>

              <button className="bg-blue-600 px-4 py-2 rounded-xl flex items-center gap-2">
                <Download size={18} />
                Exportar
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3">Entidad</th>
                  <th className="text-left py-3">Concepto</th>
                  <th className="text-left py-3">Monto</th>
                </tr>
              </thead>

              <tbody>
                {data.slice(0, 15).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800"
                  >
                    <td className="py-3">
                      {item.ENTIDAD}
                    </td>

                    <td className="py-3">
                      {item.CONCEPTO}
                    </td>

                    <td className="py-3">
                      Bs {item.DEBE}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}