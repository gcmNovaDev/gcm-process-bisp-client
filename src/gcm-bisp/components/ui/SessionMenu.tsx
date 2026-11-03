'use client'

import { useState } from "react"
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react"
import { useAuthStore } from "../store/authStore"

export default function SessionMenu() {
  const [open, setOpen] = useState(false)
  const { auth, logout } = useAuthStore()
  
  const usuario = auth?.data?.usuario;
  const platformLoginUrl = process.env.NEXT_PUBLIC_PLATFORM_LOGIN_URL || "http://localhost:3001/plataform-process/Auth/Login";

  const handleLogout = () => {
    logout();
    if (window.parent && window.parent !== window) {
      window.parent.location.href = platformLoginUrl;
    } else {
      window.location.href = platformLoginUrl;
    }
  };

  if (!usuario) return null;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition border border-transparent hover:border-gray-200"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
          {usuario.nombreCompleto?.substring(0, 2) || "U"}
        </div>
        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-sm font-semibold text-gray-900">{usuario.nombreCompleto}</span>
          <span className="text-xs text-gray-500 font-medium">{usuario.email}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sesión Activa</p>
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck size={14} />
                <span className="text-xs font-mono truncate max-w-[140px] uppercase">
                  {auth?.data?.sesion?.sessionIdString || "ID-UNKNOWN"}
                </span>
              </div>
            </div>

            <button
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex items-center gap-3 transition-colors text-gray-700"
            >
              <Settings size={18} className="text-gray-400" />
              Configuración
            </button>

            <div className="h-px bg-gray-100 my-1 mx-2" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 font-medium flex items-center gap-3 transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}