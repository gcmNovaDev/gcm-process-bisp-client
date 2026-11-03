"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Clock } from "lucide-react";

interface InactivityWarningModalProps {
  isOpen: boolean;
  /** Segundos que tiene el usuario para reaccionar antes del logout. Default: 120 (2 min) */
  countdownSecs?: number;
  onContinue: () => void;
  onExpired: () => void;
}

/**
 * Modal de advertencia de inactividad.
 *
 * Se muestra cuando el usuario lleva N minutos sin interacción.
 * Muestra un countdown regresivo. Si el usuario presiona "Continuar", se
 * resetea el timer. Si el countdown llega a 0, dispara `onExpired` (logout).
 *
 * No tiene botón de cerrar (X): presionar Esc es la única forma de cerrarlo
 * y se trata como "continuar" (cualquier interacción = actividad).
 */
export default function InactivityWarningModal({
  isOpen,
  countdownSecs = 120,
  onContinue,
  onExpired,
}: InactivityWarningModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSecs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  // Reiniciar countdown cada vez que el modal se abre
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(countdownSecs);
      hasExpiredRef.current = false;

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              // Pequeño delay para dejar que el estado se actualice antes del logout
              setTimeout(() => onExpired(), 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Limpiar interval cuando se cierra el modal
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, countdownSecs, onExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Calcular el porcentaje para el círculo de progreso
  const progressPercent = (secondsLeft / countdownSecs) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Color dinámico según tiempo restante
  const isUrgent = secondsLeft <= 30;
  const strokeColor = isUrgent ? "#ef4444" : "#f59e0b"; // rojo si < 30s, naranja si no

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[10050]"
        onClose={() => {
          // Cerrar con Esc = el usuario está interactuando = continuar
          onContinue();
        }}
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
              {/* Icono */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors duration-500 ${
                  isUrgent ? "bg-red-50" : "bg-amber-50"
                }`}
              >
                <Clock
                  size={28}
                  className={`transition-colors duration-500 ${
                    isUrgent ? "text-red-500" : "text-amber-500"
                  }`}
                />
              </div>

              {/* Título */}
              <Dialog.Title
                as="h3"
                className="text-lg font-bold text-gray-900 mb-1"
              >
                ¿Sigues ahí?
              </Dialog.Title>
              <p className="text-sm text-gray-500 mb-6">
                Tu sesión cerrará automáticamente por inactividad
              </p>

              {/* Countdown circular */}
              <div className="relative flex items-center justify-center mb-6">
                <svg width="100" height="100" className="-rotate-90">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                  />
                  {/* Progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                  />
                </svg>
                <span
                  className={`absolute text-xl font-bold tabular-nums transition-colors duration-500 ${
                    isUrgent ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {formattedTime}
                </span>
              </div>

              {/* Botón principal */}
              <button
                onClick={onContinue}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isUrgent
                    ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
                    : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400"
                }`}
              >
                Continuar trabajando
              </button>

              <p className="text-xs text-gray-400 mt-4">
                Serás redirigido al inicio de sesión al expirar el tiempo
              </p>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
