"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const processingSteps = [
  { label: "Analizando tu web", icon: "🌐", duration: 5 },
  { label: "Detectando mercado y demanda", icon: "📊", duration: 8 },
  { label: "Identificando competidores", icon: "🎯", duration: 10 },
  { label: "Generando informe completo", icon: "📝", duration: 7 },
];

export default function ProcesandoPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fake progress bar
  useEffect(() => {
    const totalDuration = 30; // seconds
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min((elapsed / totalDuration) * 95, 95); // max 95% until real completion
      setProgress(pct);

      // Determine current step
      let cumulative = 0;
      for (let i = 0; i < processingSteps.length; i++) {
        cumulative += processingSteps[i].duration;
        if (elapsed < cumulative) {
          setCurrentStep(i);
          break;
        }
        if (i === processingSteps.length - 1) {
          setCurrentStep(i);
        }
      }
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();

        if (data.status === "completed" && data.report_id) {
          setProgress(100);
          setTimeout(() => {
            router.push(`/informe/${data.report_id}`);
          }, 500);
        } else if (data.status === "failed") {
          setError(data.error_message || "Error al generar el informe");
        }
      } catch {
        // silently retry
      }
    };

    intervalRef.current = setInterval(poll, 3000);
    // Also poll immediately
    poll();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Error al generar el informe</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Volver a intentar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">{processingSteps[currentStep]?.icon}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Generando tu informe PPC
        </h1>
        <p className="text-gray-500 mb-8">Esto tarda menos de 1 minuto</p>

        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {processingSteps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : isDone
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-blue-700" : isDone ? "text-green-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-8">
          No cierres esta pestaña. Serás redirigido automáticamente.
        </p>
      </div>
    </div>
  );
}
