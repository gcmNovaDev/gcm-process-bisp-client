"use client";

import Icon from "./Icon";
import { SidebarLink } from "./sidebar-link";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { usePathname } from "next/navigation";

export function SidebarLinkGroup({ item, collapsed }: any) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const hasActiveChild = item.children?.some((child: any) => pathname === child.path);

  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);

  const toggle = () => {
    if (collapsed) return;
    setOpen((prev) => !prev);
  };

  const isActive = open || hasActiveChild;

  return (
    <div className="mb-4 last:mb-0">
      <button
        type="button"
        onClick={toggle}
        className={`
          flex items-center justify-between w-full gap-3 px-4 py-3 rounded-2xl transition-colors text-sm font-semibold
          ${isActive ? "bg-primary-700 text-white" : "text-primary-200 hover:bg-primary-900"}
          ${collapsed ? "justify-center px-2" : ""}
        `}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
          {item.icon && (
            <Icon
              name={item.icon}
              size={18}
              className={isActive ? "text-white" : "text-primary-300"}
            />
          )}
          {!collapsed && <span>{item.name}</span>}
        </div>

        {!collapsed && (
          <ChevronRight
            size={16}
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        )}
      </button>

      <Transition
        show={open && !collapsed}
        enter="transition-all duration-200 ease-out"
        enterFrom="max-h-0 opacity-0"
        enterTo="max-h-96 opacity-100"
        leave="transition-all duration-150 ease-in"
        leaveFrom="max-h-96 opacity-100"
        leaveTo="max-h-0 opacity-0"
      >
        <div className="mt-2 flex flex-col gap-2 px-2 overflow-hidden">
          {item.children.map((child: any) => (
            <SidebarLink
              key={child.id}
              name={child.name}
              path={child.path}
              icon={child.icon}
            />
          ))}
        </div>
      </Transition>
    </div>
  );
}