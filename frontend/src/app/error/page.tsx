"use client";

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Algo ha salido mal</h1>
        <p className="text-gray-600 mb-8">
          No hemos podido procesar tu solicitud. Puede ser un problema temporal. Inténtalo de nuevo en unos minutos.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
