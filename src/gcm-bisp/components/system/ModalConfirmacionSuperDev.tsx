'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';

interface ModalConfirmacionSuperDevProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void> | void;
  titulo: string;
  descripcion: string;
  detalleEntidad?: { [key: string]: string | number | undefined | null };
  textoBotonConfirmar?: string;
  colorVariante?: 'warning' | 'danger' | 'primary';
  isLoading?: boolean;
}

export default function ModalConfirmacionSuperDev({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  descripcion,
  detalleEntidad,
  textoBotonConfirmar = 'Confirmar Acción como SuperDev',
  colorVariante = 'warning',
  isLoading = false,
}: ModalConfirmacionSuperDevProps) {
  const [motivo, setMotivo] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) return;
    setMotivo('');
    setErrorLocal(null);
    onClose();
  };

  const handleConfirm = async () => {
    const trimmed = motivo.trim();
    if (trimmed.length < 10) {
      setErrorLocal('El motivo de la acción técnica debe tener al menos 10 caracteres.');
      return;
    }

    try {
      setErrorLocal(null);
      await onConfirm(trimmed);
      setMotivo('');
      onClose();
    } catch (err: any) {
      setErrorLocal(err?.message || 'Ocurrió un error al procesar la acción de SuperDev.');
    }
  };

  const getVariantStyles = () => {
    switch (colorVariante) {
      case 'danger':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          iconColor: 'text-rose-600',
          btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white',
          borderAccent: 'border-rose-500',
        };
      case 'primary':
        return {
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          iconColor: 'text-indigo-600',
          btnConfirm: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          borderAccent: 'border-indigo-500',
        };
      case 'warning':
      default:
        return {
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white',
          borderAccent: 'border-amber-500',
        };
    }
  };

  const variant = getVariantStyles();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10001]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-out duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border-t-4 border-amber-500">
              
              {/* Header con Badge de SuperDev */}
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${variant.badgeBg} border`}>
                  <ShieldAlert className={`w-6 h-6 ${variant.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                      SuperDev Privileged Action
                    </span>
                  </div>
                  <Dialog.Title className="text-lg font-bold text-slate-800 mt-1">
                    {titulo}
                  </Dialog.Title>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-3 text-sm text-slate-600">
                {descripcion}
              </div>

              {/* Detalle de entidad técnica si aplica */}
              {detalleEntidad && Object.keys(detalleEntidad).length > 0 && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <span className="font-semibold text-slate-700 uppercase tracking-wide block">
                    Parámetros del Ajuste:
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(detalleEntidad).map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-slate-500 capitalize">{k}:</span>
                        <span className="font-semibold text-slate-800 truncate">{String(v ?? 'N/A')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertencia de Auditoría */}
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Esta acción bypass/forzada quedará registrada en la bitácora de auditoría con tu usuario, fecha y el motivo proporcionado.
                </p>
              </div>

              {/* Justificación obligatoria */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Motivo o Justificación Técnica <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    if (errorLocal) setErrorLocal(null);
                  }}
                  disabled={isLoading}
                  placeholder="Explica detalladamente la razón de la intervención técnica (mínimo 10 caracteres)..."
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition disabled:bg-slate-100"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Mínimo 10 caracteres</span>
                  <span className={motivo.trim().length >= 10 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                    {motivo.trim().length}/10 min
                  </span>
                </div>
              </div>

              {/* Error si existe */}
              {errorLocal && (
                <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                  {errorLocal}
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading || motivo.trim().length < 10}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variant.btnConfirm}`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {textoBotonConfirmar}
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
