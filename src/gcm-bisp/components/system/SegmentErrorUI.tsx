"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface SegmentErrorUIProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SegmentErrorUI({ error, reset }: SegmentErrorUIProps) {
  useEffect(() => {
    console.error("Error en segmento GCM Process BISP:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg shadow-sm border border-app-gray-1-200">
      <div className="p-4 bg-secondary-50 rounded-full mb-6">
        <AlertTriangle className="w-12 h-12 text-secondary-600" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-2xl font-bold text-app-gray-1-900 mb-3">
        Lamentablemente, ha ocurrido un error
      </h2>
      
      <p className="text-app-gray-1-600 mb-8 max-w-md">
        No pudimos cargar esta sección del módulo.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors duration-200"
        >
          <RefreshCcw className="w-4 h-4" />
          Intentar de nuevo
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-2.5 bg-app-gray-1-100 hover:bg-app-gray-1-200 text-app-gray-1-800 font-medium rounded-md transition-colors duration-200"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
