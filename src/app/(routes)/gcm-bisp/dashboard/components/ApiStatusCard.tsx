'use client';

import Icon from "@/gcm-bisp/components/ui/Icon";
import { Badge } from "@/gcm-bisp/components/system/Badge";
import { ApiStatus } from "../api/types/dashboard.types";

interface ApiStatusCardProps {
  status: ApiStatus | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function ApiStatusCard({ status, loading, error, onRefresh }: ApiStatusCardProps) {
  const online = !!status?.ok && !error;

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-white p-5 font-poppins">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Server" size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-800">Estado de la API</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          title="Volver a consultar"
        >
          <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Consultando...</p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant={online ? "success" : "error"} radius="full">
              {online ? "En línea" : "Sin conexión"}
            </Badge>
            <span className="text-xs text-slate-500">{process.env.NEXT_PUBLIC_APP_BASE_URL}</span>
          </div>
          <p className="text-sm text-slate-600">{online ? status?.message : error}</p>
          {online && status?.timestamp && (
            <p className="text-xs text-slate-400">
              Respuesta: {new Date(status.timestamp).toLocaleString("es-HN")}
            </p>
          )}
        </>
      )}

      <p className="mt-1 rounded-[10px] bg-slate-50 p-3 text-xs text-slate-500">
        Esta tarjeta es el ejemplo vivo del flujo: <code>page.tsx</code> → <code>getApiStatus()</code> en{" "}
        <code>api/services</code> → <code>apiService</code> + interceptores → <code>GET /api/</code>.
      </p>
    </div>
  );
}
