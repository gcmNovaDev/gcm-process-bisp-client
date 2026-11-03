import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold text-slate-800">
        🚧 Estamos trabajando en esta funcionalidad
      </h1>
      <p className="text-slate-500">
        Esta sección estará disponible próximamente.
      </p>
      <Link href="/gcm-bisp/dashboard" className="text-blue-500 underline">
        Volver al inicio
      </Link>
    </div>
  );
}