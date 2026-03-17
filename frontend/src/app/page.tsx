"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">PPC Market Report</span>
          <span className="text-xs text-gray-400 hidden sm:inline">by George Growth</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#ejemplo" className="text-sm text-gray-600 hover:text-blue-600 transition hidden sm:inline">
            Ver ejemplo
          </a>
          <a
            href="#hero"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Analizar web
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website_url: url.trim() }),
      });

      if (!res.ok) throw new Error("Error al crear el análisis");

      const data = await res.json();
      router.push(`/procesando/${data.job_id}`);
    } catch {
      setError("No se pudo iniciar el análisis. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <section id="hero" className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mercado, competencia y costes PPC en 1 minuto
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Analiza tu web y descubre tu{" "}
            <span className="text-blue-600">oportunidad real en PPC</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Descubre volumen de demanda, competidores activos, costes estimados por clic y oportunidades reales en PPC.{" "}
            <span className="font-semibold text-gray-900">Gratis.</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tuempresa.com"
              className="flex-1 px-5 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analizando...
                </span>
              ) : (
                "Generar informe →"
              )}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sin acceso a tu cuenta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Top competidores detectados
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mercado + CPC + oportunidades
            </span>
          </div>
        </div>

        {/* Mock report card */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-3xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">PPC Market Report</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">ejemplo-empresa.com</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold text-blue-600">7.8</div>
                  <p className="text-xs text-gray-500">Market Score</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">Alta</p>
                  <p className="text-xs text-gray-500 mt-1">Oportunidad</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">€2-5</p>
                  <p className="text-xs text-gray-500 mt-1">CPC medio est.</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-xs text-gray-500 mt-1">Competidores</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;El mercado PPC para este sector muestra demanda activa con CPC moderados. Se detectan 3 competidores con presencia fuerte en Google Ads. Existe una ventana de oportunidad en keywords long-tail...&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "🏢",
    title: "Entendimiento del negocio",
    desc: "El sistema analiza tu web y entiende qué vendes, a quién te diriges y en qué mercado operas.",
  },
  {
    icon: "📊",
    title: "Mercado PPC",
    desc: "Keywords relevantes agrupadas en clusters con estimaciones de volumen, CPC y competencia.",
  },
  {
    icon: "🎯",
    title: "Top 3 competidores",
    desc: "Competidores probables de tu nicho con señales de actividad publicitaria por canal.",
  },
  {
    icon: "📡",
    title: "Señales por canal",
    desc: "Detección de presencia en Google Ads, Meta Ads, LinkedIn Ads y TikTok Ads.",
  },
  {
    icon: "💡",
    title: "Insights estratégicos",
    desc: "Conclusiones claras sobre tu mercado PPC: oportunidades, riesgos y tendencias.",
  },
  {
    icon: "🚀",
    title: "Recomendaciones accionables",
    desc: "Quick wins, canal prioritario, enfoque recomendado y próximos pasos concretos.",
  },
];

function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Qué incluye tu informe
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Un análisis completo de tu mercado PPC en una sola página
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    num: "1",
    title: "Pega tu web",
    desc: "Introduce la URL de tu empresa. No necesitamos acceso a ninguna cuenta.",
    color: "bg-blue-600",
  },
  {
    num: "2",
    title: "Analizamos mercado y competencia",
    desc: "Nuestro sistema analiza tu web, entiende tu negocio y escanea el mercado PPC.",
    color: "bg-blue-500",
  },
  {
    num: "3",
    title: "Recibes tu informe",
    desc: "En menos de 1 minuto tienes un informe visual con datos, insights y recomendaciones.",
    color: "bg-blue-400",
  },
];

function HowItWorks() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Cómo funciona</h2>
          <p className="text-lg text-gray-500">3 pasos. Menos de 1 minuto.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5`}
              >
                {s.num}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleDashboard() {
  return (
    <section id="ejemplo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Así se ve un resultado real
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Un vistazo al tipo de informe que recibirás
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-10 text-white max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-blue-400 text-sm font-medium">PPC MARKET REPORT</p>
              <h3 className="text-2xl font-bold mt-1">software-crm.es</h3>
              <p className="text-gray-400 text-sm mt-1">SaaS · CRM · España</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl px-6 py-4 text-center">
              <p className="text-5xl font-extrabold text-blue-400">8.2</p>
              <p className="text-xs text-blue-300 mt-1">Market Score</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Oportunidad", value: "Alta", color: "text-green-400", bg: "bg-green-500/10" },
              { label: "CPC medio", value: "€3-8", color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Competencia", value: "Media", color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Confianza", value: "Alta", color: "text-blue-400", bg: "bg-blue-500/10" },
            ].map((kpi, i) => (
              <div key={i} className={`${kpi.bg} rounded-xl p-4 text-center`}>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Competitors mini */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { name: "HubSpot", google: "high", meta: "high", linkedin: "high" },
              { name: "Salesforce", google: "high", meta: "medium", linkedin: "high" },
              { name: "Pipedrive", google: "medium", meta: "high", linkedin: "medium" },
            ].map((c, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <p className="font-semibold text-sm mb-2">{c.name}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.google === "high" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    Google: {c.google}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.meta === "high" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    Meta: {c.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Insight preview */}
          <div className="bg-white/5 rounded-xl p-5">
            <p className="text-blue-400 text-xs font-semibold uppercase mb-3">💡 Insight destacado</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              &ldquo;El mercado de CRM en España muestra demanda activa con búsquedas transaccionales relevantes. HubSpot y Salesforce dominan el paid search, pero hay oportunidades en long-tail para nichos específicos como CRM para pymes o CRM sector inmobiliario.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const audiences = [
  { icon: "👔", title: "CEOs y Founders", desc: "Que quieren saber si PPC tiene sentido para su negocio antes de invertir." },
  { icon: "📈", title: "CMOs", desc: "Que necesitan datos rápidos para validar o priorizar el canal PPC." },
  { icon: "🎯", title: "Marketing Managers", desc: "Que quieren un primer diagnóstico de mercado sin depender de una agencia." },
  { icon: "🚀", title: "Growth Teams", desc: "Que buscan nuevos canales de adquisición con datos de demanda reales." },
  { icon: "🏢", title: "Agencias y Consultores", desc: "Que quieren ofrecer valor desde el primer contacto con un prospect." },
  { icon: "💻", title: "Startups", desc: "Que necesitan validar si hay demanda de búsqueda antes de lanzar campañas." },
];

function Audience() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Pensado para</h2>
          <p className="text-lg text-gray-500">Perfiles que más valor sacan de este informe</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((a, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition">
              <span className="text-2xl">{a.icon}</span>
              <h3 className="font-bold text-gray-900 mt-3 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "¿Es realmente gratis?",
    a: "Sí. El informe básico es completamente gratuito. No necesitas tarjeta de crédito ni comprometerte con nada.",
  },
  {
    q: "¿Necesitáis acceso a mi cuenta de Google Ads?",
    a: "No. Solo necesitamos la URL de tu web. El análisis se hace desde fuera, sin acceso a ninguna cuenta privada.",
  },
  {
    q: "¿Los datos son exactos?",
    a: "Los datos son estimaciones basadas en el análisis del mercado. Los volúmenes y CPCs son orientativos y se indican como tales. Para datos exactos, recomendamos una auditoría profesional.",
  },
  {
    q: "¿Cuánto tarda en generarse?",
    a: "Menos de 1 minuto. El sistema analiza tu web, escanea el mercado y genera el informe en tiempo real.",
  },
  {
    q: "¿Para qué tipo de negocios funciona?",
    a: "Funciona para cualquier negocio con presencia web: SaaS, ecommerce, servicios profesionales, startups, empresas B2B y B2C.",
  },
  {
    q: "¿Qué hago después con el informe?",
    a: "Úsalo para decidir si PPC tiene sentido para tu negocio, identificar oportunidades y preparar tu estrategia. Si quieres ir más lejos, puedes solicitar una auditoría completa.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{f.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          ¿Listo para descubrir tu oportunidad en PPC?
        </h2>
        <p className="text-blue-100 text-lg mb-8">
          Introduce tu web y recibe un informe completo en menos de 1 minuto. Gratis.
        </p>
        <a
          href="#hero"
          className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg"
        >
          Analizar mi web ahora →
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm">PPC Market Report by George Growth</span>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} George Growth. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ExampleDashboard />
      <Audience />
      <FAQ />
      <CTAFinal />
      <Footer />
    </main>
  );
}
