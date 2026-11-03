'use client';

import ModalBasic from "@/gcm-bisp/components/system/ModalBasic";
import { ArchitectureLayer } from "../../api/types/dashboard.types";

interface LayerDetailsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  layer: ArchitectureLayer | null;
}

export default function LayerDetailsModal({ isOpen, setIsOpen, layer }: LayerDetailsModalProps) {
  return (
    <ModalBasic isOpen={isOpen} setIsOpen={setIsOpen} title={layer?.title ?? "Detalle"}>
      {layer && (
        <div className="p-6 font-poppins">
          <code className="text-xs text-primary-700">{layer.path}</code>
          <p className="mt-2 mb-4 text-sm text-slate-600">{layer.summary}</p>

          <ul className="space-y-2">
            {layer.details.map((detail) => (
              <li key={detail} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          {layer.example && (
            <div className="mt-5 rounded-[12px] bg-slate-900 p-4">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Ejemplo</p>
              <code className="text-xs text-emerald-300 break-all">{layer.example}</code>
            </div>
          )}
        </div>
      )}
    </ModalBasic>
  );
}
