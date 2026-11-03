'use client'
import { createContext, useContext } from "react"
import { useDevice } from "@/gcm-bisp/components/hooks/useDevice"


interface DeviceContextType {
  isMobile: boolean
  isReady: boolean
}

const DeviceContext = createContext<DeviceContextType | null>(null)

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const device = useDevice()

  return (
    <DeviceContext.Provider value={device}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDeviceContext() {
  const context = useContext(DeviceContext)
  if (!context) throw new Error("useDeviceContext debe usarse dentro de <DeviceProvider>")
  return context
}