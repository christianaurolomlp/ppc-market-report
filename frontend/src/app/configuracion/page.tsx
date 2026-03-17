'use client';

import { useState, useEffect } from 'react';

const ACCESS_PASSWORD = 'ppc2026';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ConfiguracionPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{ configured: boolean; source: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('ppc_config_auth');
    if (auth === 'true') {
      setAuthenticated(true);
      fetchStatus();
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/config/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem('ppc_config_auth', 'true');
      setAuthenticated(true);
      fetchStatus();
    } else {
      setPasswordError('Contraseña incorrecta.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch(`${API_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropic_api_key: apiKey.trim() }),
      });
      if (res.ok) {
        setSaveResult({ ok: true, message: '✅ API key guardada correctamente. El sistema ya puede procesar informes.' });
        setApiKey('');
        fetchStatus();
      } else {
        const err = await res.json();
        setSaveResult({ ok: false, message: `❌ Error: ${err.detail || 'No se pudo guardar.'}` });
      }
    } catch {
      setSaveResult({ ok: false, message: '❌ No se pudo conectar con el servidor.' });
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Acceso de configuración</h1>
            <p className="text-gray-500 mt-2 text-sm">Esta página es solo para administradores.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Volver a la landing</a>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Configuración del sistema</h1>
          <p className="text-gray-500 mt-1">Panel de administración interno — PPC Market Report</p>
        </div>

        {/* Estado actual */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Estado actual</h2>
          {status === null ? (
            <p className="text-gray-400 text-sm">Comprobando conexión...</p>
          ) : status.configured ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3">
              <span className="text-lg">✅</span>
              <span className="font-medium">API key configurada</span>
              <span className="text-green-500 text-sm ml-1">({status.source === 'environment' ? 'variable de entorno' : 'guardada en base de datos'})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-4 py-3">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">API key no configurada — el sistema no puede procesar informes aún.</span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-1">Anthropic API Key</h2>
          <p className="text-gray-500 text-sm mb-4">
            Obtén tu API key en{' '}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
              console.anthropic.com
            </a>
            . Esta key activa el análisis de informes con IA.
          </p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="sk-ant-api03-..."
              />
            </div>
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {saving ? 'Guardando...' : 'Guardar API Key'}
            </button>
            {saveResult && (
              <div className={`rounded-lg px-4 py-3 text-sm ${saveResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saveResult.message}
              </div>
            )}
          </form>
        </div>

        {/* Nota de seguridad */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <strong>Nota temporal:</strong> Esta página es para pruebas internas. Cuando el producto pase a producción pública, la API key se configurará via variables de entorno en el servidor y esta página será eliminada o protegida con autenticación real.
        </div>
      </div>
    </div>
  );
}
