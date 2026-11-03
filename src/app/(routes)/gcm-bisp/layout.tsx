'use client'
import Sidebar from "@/gcm-bisp/components/ui/sideBar"
import Header from "@/gcm-bisp/components/ui/Header"
import { useAppProvider } from "@/core/providers/AppProvider"
import { useDeviceContext } from "@/core/providers/DeviceProvider"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/gcm-bisp/components/auth/ProtectedRoute"

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAppProvider()
  const { isMobile } = useDeviceContext()
  const pathname = usePathname()
  const router = useRouter()

  // 1. Guardar la ruta actual en sessionStorage cada que cambie (excepto SSO)
  useEffect(() => {
    if (pathname && !pathname.includes('/sso')) {
      sessionStorage.setItem('gcm_bisp_last_path', pathname);
    }
  }, [pathname]);

  // 2. Al cargar (F5), si el sistema nos manda al dashboard por defecto por ser la raíz del Iframe,
  // pero teníamos una ruta guardada en la sesión, redirigir automáticamente a esa ruta.
  useEffect(() => {
    const lastPath = sessionStorage.getItem('gcm_bisp_last_path');

    // Si estamos en la raíz del módulo o dashboard, y tenemos una ruta previa, restaurarla
    const isRootOrDashboard = pathname === '/gcm-bisp' || pathname === '/gcm-bisp/dashboard';

    if (lastPath && isRootOrDashboard && lastPath !== pathname) {
      router.replace(lastPath);
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname, isMobile, setSidebarOpen])

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-white">

        {!isMobile && <Sidebar />}

        {isMobile && (
          <>
            <div
              className={`
                fixed inset-0 z-20 bg-black/50
                transition-opacity duration-300
                ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              `}
              onClick={() => setSidebarOpen(false)}
            />
            <div className={`
              fixed top-0 left-0 h-full z-30
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
              <Sidebar />
            </div>
          </>
        )}

        <div className="relative flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 [&>*:first-child]:scroll-mt-20 bg-white">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  )
}
