'use client';

import Icon from "@/gcm-bisp/components/ui/Icon";
import { ArchitectureLayer } from "../api/types/dashboard.types";

interface ArchitectureLayersProps {
  layers: ArchitectureLayer[];
  onSelect: (layer: ArchitectureLayer) => void;
}

export default function ArchitectureLayers({ layers, onSelect }: ArchitectureLayersProps) {
  return (
    <div className="font-poppins">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="Blocks" size={18} className="text-primary-600" />
        <h2 className="text-sm font-semibold text-slate-800">Capas del cliente</h2>
        <span className="text-xs text-slate-400">· clic en una tarjeta para ver el detalle</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelect(layer)}
            className="group flex flex-col gap-2 rounded-[16px] border border-slate-200 bg-white p-4 text-left transition hover:border-primary-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-[10px] bg-primary-50 p-2 text-primary-600 group-hover:bg-primary-100">
                <Icon name={layer.icon} size={18} />
              </span>
              <h3 className="text-sm font-semibold text-slate-800">{layer.title}</h3>
            </div>
            <code className="text-[11px] text-primary-700 break-all">{layer.path}</code>
            <p className="text-xs text-slate-500">{layer.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
