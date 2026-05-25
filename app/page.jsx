"use client";

import React, { useMemo, useState } from "react";
import {
  Trophy,
  Brain,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  Star,
  Search,
  Crown,
  Lock,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";

const matches = [
  {
    league: "Premier League",
    home: "Manchester City",
    away: "Arsenal",
    time: "15:00",
    prediction: "Over 1.5 goles",
    confidence: 87,
    odds: "1.32",
    risk: "Bajo",
    market: "Goles",
  },
  {
    league: "LaLiga",
    home: "Barcelona",
    away: "Real Betis",
    time: "16:30",
    prediction: "Barcelona o Empate",
    confidence: 82,
    odds: "1.28",
    risk: "Bajo",
    market: "Doble oportunidad",
  },
  {
    league: "Serie A",
    home: "Juventus",
    away: "Milan",
    time: "14:45",
    prediction: "Under 3.5 goles",
    confidence: 79,
    odds: "1.35",
    risk: "Medio",
    market: "Total goles",
  },
  {
    league: "Argentina",
    home: "Boca Juniors",
    away: "Racing",
    time: "19:00",
    prediction: "Menos de 4.5 goles",
    confidence: 90,
    odds: "1.18",
    risk: "Bajo",
    market: "Seguro",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "Bs 0",
    badge: "Inicio",
    features: ["2 picks diarios", "Predicciones básicas", "Confianza IA", "Mercados seguros"],
  },
  {
    name: "Pro",
    price: "Bs 39",
    badge: "Popular",
    features: ["8 picks diarios", "Análisis avanzado", "Combos recomendados", "Filtros por liga"],
    featured: true,
  },
  {
    name: "Premium",
    price: "Bs 79",
    badge: "Full IA",
    features: ["15 picks diarios", "Picks VIP", "Ranking automático", "Alertas y reportes"],
  },
];

export default function FootballAIDashboard() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const text = `${m.home} ${m.away} ${m.league} ${m.market}`.toLowerCase();
      const search = text.includes(query.toLowerCase());
      const byFilter = filter === "Todos" || m.market === filter || m.risk === filter;
      return search && byFilter;
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-[#06130c] text-white overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,.16),transparent_35%)]" />

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-green-500 grid place-items-center shadow-lg shadow-green-500/30">
              <Trophy className="text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Fútbol IA Pro</h1>
              <p className="text-xs text-green-300">Predicciones inteligentes</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <a href="#picks" className="hover:text-green-400">Picks</a>
            <a href="#analisis" className="hover:text-green-400">Análisis</a>
            <a href="#planes" className="hover:text-green-400">Planes</a>
          </nav>

          <button className="hidden md:flex bg-green-500 hover:bg-green-400 text-black px-5 py-3 rounded-2xl font-black transition hover:scale-105">
            Empezar gratis
          </button>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden">
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden px-5 pb-5 space-y-3 bg-black/70">
            <a className="block" href="#picks">Picks</a>
            <a className="block" href="#analisis">Análisis</a>
            <a className="block" href="#planes">Planes</a>
          </div>
        )}
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-2 text-green-300 text-sm font-bold mb-6">
              <Sparkles size={16} />
              IA para apuestas deportivas de fútbol
            </div>

            <h2 className="text-5xl md:text-7xl font-black leading-tight">
              Predicciones de fútbol con{" "}
              <span className="text-green-400">análisis IA</span>
            </h2>

            <p className="text-slate-300 text-lg mt-6 leading-8">
              Recibe picks diarios, confianza estimada, mercados seguros y combos
              recomendados para tomar mejores decisiones antes de apostar.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button className="bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition hover:scale-105">
                Ver picks de hoy <ChevronRight size={20} />
              </button>

              <button className="border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl font-black transition">
                Cómo funciona
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
              <MiniStat value="87%" label="Confianza media" />
              <MiniStat value="15+" label="Picks premium" />
              <MiniStat value="24/7" label="Actualización" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-green-500/20 blur-3xl rounded-full" />
            <div className="relative bg-[#0b1f14]/90 border border-green-400/20 rounded-[2rem] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-green-300 text-sm font-bold">Pick destacado</p>
                  <h3 className="text-2xl font-black">Manchester City vs Arsenal</h3>
                </div>
                <div className="bg-green-500 text-black rounded-2xl px-4 py-2 font-black">
                  87%
                </div>
              </div>

              <div className="bg-black/30 rounded-3xl p-5 border border-white/10">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Mercado recomendado</span>
                  <span>Riesgo bajo</span>
                </div>

                <h4 className="text-4xl font-black mt-4 text-green-400">
                  Over 1.5 goles
                </h4>

                <div className="mt-6 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-green-500 rounded-full" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <InfoBox label="Cuota" value="1.32" />
                  <InfoBox label="Liga" value="Premier" />
                  <InfoBox label="Hora" value="15:00" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analisis" className="max-w-7xl mx-auto px-5 py-8 grid md:grid-cols-4 gap-5">
          <Feature icon={<Brain />} title="IA predictiva" text="Evalúa forma, goles, tendencia y rendimiento." />
          <Feature icon={<Target />} title="Picks seguros" text="Enfocado en mercados de menor riesgo." />
          <Feature icon={<BarChart3 />} title="Estadísticas" text="Resumen visual para cada partido." />
          <Feature icon={<ShieldCheck />} title="Gestión de riesgo" text="Clasificación bajo, medio y alto." />
        </section>

        <section id="picks" className="max-w-7xl mx-auto px-5 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <div>
              <p className="text-green-400 font-black uppercase tracking-widest text-sm">
                Picks de hoy
              </p>
              <h2 className="text-4xl font-black mt-2">Predicciones recomendadas</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar partido..."
                  className="bg-black/30 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Todos</option>
                <option>Goles</option>
                <option>Doble oportunidad</option>
                <option>Total goles</option>
                <option>Seguro</option>
                <option>Bajo</option>
                <option>Medio</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filteredMatches.map((m, i) => (
              <MatchCard key={i} match={m} locked={i > 1} />
            ))}
          </div>
        </section>

        <section id="planes" className="max-w-7xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <p className="text-green-400 font-black uppercase tracking-widest text-sm">
              Suscripciones
            </p>
            <h2 className="text-4xl font-black mt-2">Elige tu plan</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <PlanCard key={p.name} plan={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-2xl font-black text-green-400">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-[#0b1f14] border border-green-400/10 rounded-3xl p-6 transition hover:scale-[1.03] hover:shadow-2xl hover:shadow-green-500/10">
      <div className="h-12 w-12 bg-green-500/15 text-green-400 rounded-2xl grid place-items-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="text-slate-400 mt-2">{text}</p>
    </div>
  );
}

function MatchCard({ match, locked }) {
  return (
    <div className="bg-[#0b1f14] border border-green-400/10 rounded-3xl p-6 transition hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10">
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-green-400 text-sm font-bold">{match.league}</p>
          <h3 className="text-2xl font-black mt-1">
            {match.home} vs {match.away}
          </h3>
          <p className="text-slate-400 text-sm mt-1">Hora: {match.time}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Confianza</p>
          <p className="text-3xl font-black text-green-400">{match.confidence}%</p>
        </div>
      </div>

      <div className="mt-5 bg-black/25 rounded-3xl p-5 border border-white/10">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-slate-400 text-sm">Predicción IA</p>
            <h4 className="text-2xl font-black mt-1">{match.prediction}</h4>
          </div>

          {locked && (
            <div className="bg-yellow-500/15 text-yellow-300 rounded-2xl px-3 py-2 h-fit flex items-center gap-2 text-sm font-bold">
              <Lock size={15} /> PRO
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <InfoBox label="Cuota" value={match.odds} />
          <InfoBox label="Riesgo" value={match.risk} />
          <InfoBox label="Mercado" value={match.market} />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-2xl font-black transition hover:scale-105">
          Ver análisis
        </button>
        <button className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-2xl font-black transition">
          Añadir combo
        </button>
      </div>
    </div>
  );
}

function PlanCard({ plan }) {
  return (
    <div
      className={`rounded-3xl p-6 border transition hover:scale-[1.03] ${
        plan.featured
          ? "bg-green-500 text-black border-green-400 shadow-2xl shadow-green-500/20"
          : "bg-[#0b1f14] border-green-400/10"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className={`text-sm font-black ${plan.featured ? "text-black/70" : "text-green-400"}`}>
            {plan.badge}
          </p>
          <h3 className="text-3xl font-black">{plan.name}</h3>
        </div>
        {plan.featured ? <Crown /> : <Star className="text-green-400" />}
      </div>

      <p className="text-4xl font-black">
        {plan.price}
        <span className="text-sm font-bold opacity-70"> / mes</span>
      </p>

      <ul className="space-y-3 mt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 font-semibold">
            <Zap size={18} />
            {f}
          </li>
        ))}
      </ul>

      <button
        className={`w-full mt-8 py-4 rounded-2xl font-black transition hover:scale-105 ${
          plan.featured
            ? "bg-black text-white"
            : "bg-green-500 text-black hover:bg-green-400"
        }`}
      >
        Elegir plan
      </button>
    </div>
  );
}