"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Keyword {
  cluster_name: string;
  keyword: string;
  search_volume: string | null;
  cpc_estimate: string | null;
  competition_level: string | null;
  intent_type: string | null;
}

interface Competitor {
  competitor_name: string;
  competitor_domain: string | null;
  google_signal: string | null;
  meta_signal: string | null;
  linkedin_signal: string | null;
  tiktok_signal: string | null;
  activity_level: string | null;
  notes: string | null;
}

interface Insight {
  type: string;
  content: string;
  priority_order: number;
}

interface ReportData {
  id: string;
  website_url: string;
  what_it_sells: string | null;
  target_client: string | null;
  category: string | null;
  market: string | null;
  language: string | null;
  market_score: number | null;
  opportunity_level: string | null;
  executive_summary: string | null;
  confidence_level: string | null;
  created_at: string;
  keywords: Keyword[];
  competitors: Competitor[];
  insights: Insight[];
}

function SignalBadge({ level }: { level: string | null }) {
  if (!level || level === "none") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Sin señal</span>;
  }
  const colors: Record<string, string> = {
    high: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level] || "bg-gray-100 text-gray-500"}`}>
      {level === "high" ? "Alta" : level === "medium" ? "Media" : "Baja"}
    </span>
  );
}

function LevelBadge({ level, label }: { level: string | null; label?: string }) {
  const colors: Record<string, string> = {
    high: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[level || "medium"] || "bg-gray-100 text-gray-500"}`}>
      {label || labels[level || "medium"] || level}
    </span>
  );
}

function IntentBadge({ intent }: { intent: string | null }) {
  const colors: Record<string, string> = {
    commercial: "bg-blue-100 text-blue-700",
    transactional: "bg-purple-100 text-purple-700",
    informational: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    commercial: "Comercial",
    transactional: "Transaccional",
    informational: "Informacional",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[intent || ""] || "bg-gray-100 text-gray-500"}`}>
      {labels[intent || ""] || intent}
    </span>
  );
}

export default function InformePage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) return;
    fetch(`${API_URL}/api/reports/${reportId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Report not found");
        return res.json();
      })
      .then(setReport)
      .catch(() => setError("No se pudo cargar el informe"))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Informe no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || "No pudimos encontrar este informe."}</p>
          <a href="/" className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  // Group keywords by cluster
  const clusters: Record<string, Keyword[]> = {};
  report.keywords.forEach((kw) => {
    if (!clusters[kw.cluster_name]) clusters[kw.cluster_name] = [];
    clusters[kw.cluster_name].push(kw);
  });

  const insightsOnly = report.insights.filter((i) => i.type === "insight");
  const recommendations = report.insights.filter((i) => i.type === "recommendation");

  const scoreColor =
    (report.market_score || 0) >= 7
      ? "text-green-600"
      : (report.market_score || 0) >= 4
      ? "text-amber-600"
      : "text-red-600";

  const scoreBg =
    (report.market_score || 0) >= 7
      ? "from-green-50 to-green-100 border-green-200"
      : (report.market_score || 0) >= 4
      ? "from-amber-50 to-amber-100 border-amber-200"
      : "from-red-50 to-red-100 border-red-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">PPC Market Report</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Score + URL header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Informe PPC para</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 break-all">{report.website_url}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {report.category && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">{report.category}</span>
                )}
                {report.market && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{report.market}</span>
                )}
                <LevelBadge level={report.confidence_level} label={`Confianza: ${report.confidence_level === "high" ? "Alta" : report.confidence_level === "medium" ? "Media" : "Baja"}`} />
              </div>
            </div>
            <div className={`bg-gradient-to-br ${scoreBg} border rounded-2xl px-8 py-5 text-center flex-shrink-0`}>
              <p className={`text-5xl font-extrabold ${scoreColor}`}>{report.market_score || "–"}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Market Score</p>
            </div>
          </div>
        </div>

        {/* Executive summary */}
        <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold">Resumen ejecutivo</h2>
          </div>
          <p className="text-blue-100 leading-relaxed text-base">{report.executive_summary}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              report.opportunity_level === "high" ? "bg-green-500/20 text-green-200" :
              report.opportunity_level === "medium" ? "bg-amber-500/20 text-amber-200" :
              "bg-red-500/20 text-red-200"
            }`}>
              Oportunidad: {report.opportunity_level === "high" ? "Alta" : report.opportunity_level === "medium" ? "Media" : "Baja"}
            </span>
          </div>
        </div>

        {/* Business understanding */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-2xl">🏢</span> Tu negocio
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {report.what_it_sells && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Qué ofrece</p>
                <p className="text-sm text-gray-800">{report.what_it_sells}</p>
              </div>
            )}
            {report.target_client && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Cliente objetivo</p>
                <p className="text-sm text-gray-800">{report.target_client}</p>
              </div>
            )}
            {report.category && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Categoría</p>
                <p className="text-sm text-gray-800">{report.category}</p>
              </div>
            )}
            {report.market && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Mercado</p>
                <p className="text-sm text-gray-800">{report.market}</p>
              </div>
            )}
          </div>
        </div>

        {/* Keywords by cluster */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-2xl">📊</span> Mercado PPC
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Keywords agrupadas por cluster temático. Volúmenes y CPCs son estimaciones orientativas.
          </p>
          <div className="space-y-6">
            {Object.entries(clusters).map(([clusterName, keywords]) => (
              <div key={clusterName}>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">{clusterName}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Keyword</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">Volumen</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">CPC est.</th>
                        <th className="text-center py-2 px-3 text-gray-500 font-medium">Competencia</th>
                        <th className="text-center py-2 pl-3 text-gray-500 font-medium">Intención</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((kw, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 pr-4 font-medium text-gray-900">{kw.keyword}</td>
                          <td className="text-center py-2.5 px-3"><LevelBadge level={kw.search_volume} /></td>
                          <td className="text-center py-2.5 px-3 text-gray-600 font-mono text-xs">{kw.cpc_estimate || "–"}</td>
                          <td className="text-center py-2.5 px-3"><LevelBadge level={kw.competition_level} /></td>
                          <td className="text-center py-2.5 pl-3"><IntentBadge intent={kw.intent_type} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors */}
        {report.competitors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Top {report.competitors.length} competidores
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Competidores probables inferidos del análisis del nicho.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {report.competitors.map((comp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{comp.competitor_name}</h3>
                    <LevelBadge level={comp.activity_level} label={comp.activity_level === "high" ? "Muy activo" : comp.activity_level === "medium" ? "Activo" : "Poco activo"} />
                  </div>
                  {comp.competitor_domain && (
                    <p className="text-xs text-gray-400 mb-3">{comp.competitor_domain}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Google Ads</span>
                      <SignalBadge level={comp.google_signal} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Meta Ads</span>
                      <SignalBadge level={comp.meta_signal} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">LinkedIn Ads</span>
                      <SignalBadge level={comp.linkedin_signal} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">TikTok Ads</span>
                      <SignalBadge level={comp.tiktok_signal} />
                    </div>
                  </div>
                  {comp.notes && (
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200 italic">{comp.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Channel signals overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-2xl">📡</span> Señales por canal
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Google", "Meta", "LinkedIn", "TikTok"].map((channel) => {
              const key = `${channel.toLowerCase()}_signal` as keyof Competitor;
              // Aggregate signal across competitors
              const signals = report.competitors.map((c) => c[key] as string).filter(Boolean);
              const hasHigh = signals.includes("high");
              const hasMedium = signals.includes("medium");
              const overallLevel = hasHigh ? "high" : hasMedium ? "medium" : signals.length > 0 ? "low" : null;

              return (
                <div key={channel} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="font-bold text-gray-900 mb-2">{channel}</p>
                  <SignalBadge level={overallLevel} />
                  <p className="text-xs text-gray-400 mt-2">
                    {overallLevel === "high" ? "Competidores activos" : overallLevel === "medium" ? "Actividad moderada" : overallLevel === "low" ? "Poca actividad" : "Sin datos"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        {insightsOnly.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-2xl">💡</span> Insights estratégicos
            </h2>
            <div className="space-y-3">
              {insightsOnly.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-2xl">🚀</span> Recomendaciones
            </h2>
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence badge */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Nivel de confianza del informe</p>
          <div className="inline-flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              report.confidence_level === "high" ? "bg-green-500" :
              report.confidence_level === "medium" ? "bg-amber-500" : "bg-red-500"
            }`} />
            <span className="text-lg font-bold text-gray-900">
              {report.confidence_level === "high" ? "Confianza alta" :
               report.confidence_level === "medium" ? "Confianza media" : "Confianza baja"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {report.confidence_level === "high"
              ? "El sistema ha podido extraer información suficiente para generar un informe sólido."
              : report.confidence_level === "medium"
              ? "Algunos datos son inferidos. Recomendamos validar con fuentes adicionales."
              : "Información limitada. Los resultados son orientativos y requieren validación."}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            ¿Quieres una auditoría completa?
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Este informe es un primer diagnóstico. Si quieres un análisis en profundidad con datos reales y una estrategia PPC personalizada, hablemos.
          </p>
          <a
            href="mailto:hello@georgegrowth.com"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg"
          >
            Habla con nosotros →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-400">
          PPC Market Report by George Growth · Los datos presentados son estimaciones orientativas
        </div>
      </footer>
    </div>
  );
}
