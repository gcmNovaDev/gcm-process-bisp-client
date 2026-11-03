'use client'
import { useAppProvider } from "@/core/providers/AppProvider"
import { useDeviceContext } from "@/core/providers/DeviceProvider"
import { useModuleStore } from "../store/useModuleStore"
import SessionMenu from "./SessionMenu"
import useClock from "../hooks/useClock"
import { useEffect, useState } from "react"
import { PanelLeft, Menu } from "lucide-react"

export default function Header() {
  const { name, description } = useModuleStore()
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAppProvider()
  const { isMobile } = useDeviceContext()
  const now = useClock()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const fullDate = isMounted ? new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(now) : ""

  return (
    <header className="w-full h-[3.75rem] border-b bg-white px-4 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Desktop: PanelLeft para colapsar/expandir el sidebar */}
        {/* Mobile: Menu (hamburguesa) para abrir el drawer */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
        >
          {isMobile ? <Menu size={20} /> : <PanelLeft size={20} />}
        </button>

        {!isMobile && (
          <div>
            <h2 className="text-lg font-semibold capitalize">{name}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        )}
      </div>

      {/* Center — solo en desktop */}
      {!isMobile && (
        <div className="flex-1 flex justify-center">
          <p className="text-sm text-gray-700 font-medium capitalize tracking-wide">
            {fullDate}
          </p>
        </div>
      )}

      {/* Right */}
      <SessionMenu />
    </header>
  )
}