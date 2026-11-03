'use client'

import { useAuthStore } from "../store/authStore"
import ModalAction from "./ModalAction"
import { ShieldAlert } from "lucide-react"

export default function SessionErrorListener() {
  const { sessionError, setSessionError } = useAuthStore()

  return (
    <ModalAction 
      isOpen={!!sessionError} 
      setIsOpen={(val) => !val && setSessionError(null)}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sesión Interrumpida
        </h3>
        <p className="text-gray-500 max-w-[280px]">
          {sessionError || "No estás autorizado. Redirigiendo al inicio de sesión..."}
        </p>
      </div>
    </ModalAction>
  )
}
