'use client'
import { useAppProvider } from "@/core/providers/AppProvider"
import { useDeviceContext } from "@/core/providers/DeviceProvider"
import { SidebarLinkGroup } from "./sidebar-link-group"
import Logo from "./Logo"
import Icon from "./Icon"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/gcm-bisp/components/store/authStore"

export default function Sidebar() {
  const { sidebarOpen } = useAppProvider()
  const { isMobile, isReady } = useDeviceContext()
  const pathname = usePathname()

  const isExpanded = isMobile ? true : sidebarOpen

  const [backendItems, setBackendItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cachedSidebar = useAuthStore((state) => state.auth?.data?.sidebar)

  useEffect(() => {
    if (cachedSidebar && cachedSidebar.length > 0) {
      setBackendItems(cachedSidebar)
    }
    setLoading(false)
  }, [cachedSidebar])

  const visibleMenu = useMemo(() => {
    if (loading || backendItems.length === 0) {
      return []
    }

    const allowed = backendItems.filter((item) => item.can_access === 1 || item.can_access === true)

    const filteredAllowed = allowed.filter(item =>
      isMobile ? !item.mobile_hidden : !item.desktop_hidden
    )

    const parents = filteredAllowed
      .filter((item) => !item.parent_id)
      .sort((a, b) => a.order_index - b.order_index)

    return parents.map((parent) => {
      const children = filteredAllowed
        .filter((child) => child.parent_id === parent.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((child) => ({
          id: child.id.toString(),
          name: child.label,
          path: child.route || "",
          icon: child.icon || "Circle",
          mobileHidden: child.mobile_hidden,
          desktopHidden: child.desktop_hidden,
        }))

      return {
        id: parent.id.toString(),
        name: parent.label,
        icon: parent.icon || "Folder",
        isSection: true,
        mobileHidden: parent.mobile_hidden,
        desktopHidden: parent.desktop_hidden,
        children,
      }
    }).filter(parent => parent.children.length > 0)
  }, [backendItems, loading, isMobile])

  const dashboardPath = "/gcm-bisp/dashboard"
  const dashboardActive = pathname === dashboardPath

  if (!isReady) return null

  return (
    <aside
      className={`
        ${isExpanded ? "w-72" : "w-16"}
        transition-all duration-300 ease-in-out
        bg-primary-800 border-r border-primary-700 h-screen flex flex-col overflow-hidden
      `}
    >
      <div className="flex flex-col gap-2 px-4 py-4 border-b border-primary-700 shrink-0">
        <div className={`flex items-center ${!isExpanded ? "justify-center" : ""}`}>
            <div className={`flex-shrink-0 ${isExpanded ? "w-14 h-14" : "w-10 h-10"}`}>
              <Logo 
                clickable={true}
                adjustToContainer={true}
                className={`transition-transform duration-300 ${isExpanded ? "rotate-0" : "-rotate-90"}`} 
              />
            </div>
          {isExpanded && (
            <div>
              <p className="text-sm font-bold text-white">GCM Process BISP</p>
              <p className="text-xs text-primary-300">Gestión Procesos NOVA</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-2 pt-4 pb-3">
        <Link
          href={dashboardPath}
          className={`flex items-center gap-3 rounded-2xl transition-colors text-sm font-semibold
            ${dashboardActive ? "bg-primary-700 text-white" : "text-primary-200 hover:bg-primary-900 hover:text-white"}
            ${isExpanded ? "px-4 py-3" : "justify-center px-2 py-3"}`}
        >
          <Icon
            name="LayoutDashboard"
            size={18}
            className={dashboardActive ? "text-white" : "text-primary-300"}
          />
          {isExpanded && <span>Dashboard</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-1 py-4">
        {loading ? (
          <div className="space-y-4 px-4 py-2 animate-pulse">
            <div className="h-4 bg-primary-700 rounded w-2/3" />
            <div className="h-10 bg-primary-700 rounded-2xl w-full" />
            <div className="h-10 bg-primary-700 rounded-2xl w-full" />
          </div>
        ) : visibleMenu.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-primary-300 font-medium leading-relaxed">
            No tienes accesos asignados
          </div>
        ) : (
          visibleMenu.map((item) => (
            <SidebarLinkGroup key={item.id} item={item} collapsed={!isExpanded} />
          ))
        )}
      </div>
    </aside>
  )
}