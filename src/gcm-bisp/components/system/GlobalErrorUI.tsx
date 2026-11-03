"use client";

import { ServerCrash, RefreshCcw } from "lucide-react";
import { useEffect } from "react";
import { Poppins } from "next/font/google"; // Importamos tu fuente configurada

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

interface GlobalErrorUIProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorUI({ error, reset }: GlobalErrorUIProps) {
  useEffect(() => {
    console.error("Fallo crítico del sistema capturado:", error);
  }, [error]);

  // Al ser un error global, DEBEMOS renderizar el HTML y BODY manualmente
  return (
    <html lang="es" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen bg-app-gray-1-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center p-10 bg-white rounded-xl shadow-lg border border-app-gray-1-200">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-secondary-100 rounded-full">
              <ServerCrash className="w-16 h-16 text-secondary-600" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-app-gray-1-900 mb-4">
            Error crítico del sistema
          </h1>
          
          <p className="text-app-gray-1-600 mb-8 text-lg">
            La aplicación no pudo inicializarse correctamente.
          </p>
          
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Recargar sistema
          </button>
        </div>
      </body>
    </html>
  );
}
