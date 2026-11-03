'use client';

import Icon from "@/gcm-bisp/components/ui/Icon";
import { RequestFlowStep } from "../api/types/dashboard.types";

interface RequestFlowProps {
  steps: RequestFlowStep[];
}

const sideStyles: Record<RequestFlowStep["side"], { label: string; dot: string; text: string }> = {
  client: { label: "Cliente", dot: "bg-primary-500", text: "text-primary-700" },
  api: { label: "API", dot: "bg-accent-500", text: "text-accent-700" },
  db: { label: "BD", dot: "bg-emerald-500", text: "text-emerald-700" },
};

export default function RequestFlow({ steps }: RequestFlowProps) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-5 font-poppins">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Icon name="Workflow" size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-800">Flujo de una acción (petición protegida)</h2>
        </div>
        <div className="flex gap-3 text-xs">
          {Object.values(sideStyles).map((s) => (
            <span key={s.label} className="flex items-center gap-1 text-slate-500">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
            </span>
          ))}
        </div>
      </div>

      <ol className="relative ml-2 border-l border-slate-200">
        {steps.map((step, index) => {
          const style = sideStyles[step.side];
          return (
            <li key={step.id} className="mb-4 ml-5 last:mb-0">
              <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${style.dot}`} />
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs text-slate-400">{index + 1}.</span>
                <span className={`text-sm font-semibold ${style.text}`}>{step.title}</span>
                <code className="text-[11px] text-slate-400">{step.where}</code>
              </div>
              <p className="text-xs text-slate-500">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
