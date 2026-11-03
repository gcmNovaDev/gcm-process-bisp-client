"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Menu, Transition } from "@headlessui/react";
import { useDevice } from "@/gcm-bisp/components/hooks/useDevice";

function PortalLayer({
  enabled,
  open,
  rect,
  children,
}: {
  enabled: boolean;
  open: boolean;
  rect: DOMRect | null;
  children: ReactNode;
}) {
  if (!enabled || !open) {
    return <>{children}</>;
  }

  if (typeof document === "undefined" || !rect) {
    return null;
  }

  const maxHeight = 240;
  const width = Math.min(Math.max(rect.width, 280), window.innerWidth - 16);
  const left = Math.min(Math.max(rect.left, 8), window.innerWidth - width - 8);
  const flipUp =
    rect.bottom + 4 + maxHeight > window.innerHeight - 8 &&
    rect.top - 4 - maxHeight > 8;

  const style: CSSProperties = flipUp
    ? {
        position: "fixed",
        top: rect.top - 4,
        left,
        width,
        zIndex: 10010,
        transform: "translateY(-100%)",
      }
    : { position: "fixed", top: rect.bottom + 4, left, width, zIndex: 10010 };

  return createPortal(<div style={style}>{children}</div>, document.body);
}

type Option = { id: number; value: string };

export default function DropdownFullSearch({
  classNameButton,
  classNamePopover,
  popoverPosition = "bottom",
  onSelect,
  name,
  options = [],
  defaultValue,
  disabled = false,
  error = false,
  radius = "md",
  placeholder,
  wrapText = false,
  portal = false,
}: {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: "top" | "bottom";
  onSelect?: (value: number, key?: string) => void;
  name?: string;
  options?: Option[];
  defaultValue?: number;
  disabled?: boolean;
  error?: boolean;
  radius?: "sm" | "md" | "lg" | "full" | string;
  placeholder?: string;
  wrapText?: boolean;
  portal?: boolean;
}) {
  const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const radiusClassOrStyle =
    radiusClasses[radius as keyof typeof radiusClasses] ?? undefined;

  const { isReady } = useDevice();

  // Flota automaticamente si algun contenedor ancestro recortaria el panel
  // (overflow hidden/auto/scroll). Aplica igual en escritorio y movil.
  const [needsFloat, setNeedsFloat] = useState(false);

  const detectClip = useCallback(
    (node: HTMLElement | null) => {
      if (!node || portal || !isReady) return false;
      let p: HTMLElement | null = node.parentElement;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (
          /(hidden|auto|scroll)/.test(cs.overflowY) ||
          /(hidden|auto|scroll)/.test(cs.overflowX)
        ) {
          return true;
        }
        p = p.parentElement;
      }
      return false;
    },
    [portal, isReady]
  );

  const [selected, setSelected] = useState<number | undefined>(
    defaultValue !== undefined ? defaultValue : undefined
  );
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const anchorElRef = useRef<HTMLButtonElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = anchorElRef.current;
    setAnchorRect(el ? el.getBoundingClientRect() : null);
  }, []);

  const setButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      anchorElRef.current = node;
      setAnchorRect(node ? node.getBoundingClientRect() : null);
      setNeedsFloat(detectClip(node));
    },
    [detectClip]
  );

  useEffect(() => {
    const onResize = () => {
      measure();
      setNeedsFloat(detectClip(anchorElRef.current));
    };
    window.addEventListener("resize", onResize);
    if (portal || needsFloat) window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [portal, needsFloat, detectClip, measure]);

  useEffect(() => {
    setNeedsFloat(detectClip(anchorElRef.current));
  }, [isReady, detectClip]);

  const selectedOption = options.find((o) => o?.id === selected);

  const filteredOptions = options.filter((o) =>
    (o?.value ?? "").toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSelectOption = (option: Option) => {
    const newValue = selected === option.id ? undefined : option.id;
    setSelected(newValue);
    onSelect?.(newValue as number, newValue === undefined ? undefined : option.value);
    setSearch("");
  };

  const handleClearOption = () => {
    setSelected(undefined);
    onSelect?.(undefined as unknown as number, undefined);
    setSearch("");
  };

  const float = portal || needsFloat;

  if (!mounted) {
    return (
      <div
        className={`flex items-center w-full justify-between border text-base py-2 px-3 ${radiusClassOrStyle || ""} bg-white min-w-[11rem]
        ${
          error
            ? "border-alert-error text-alert-error"
            : "border-app-gray-1-300 text-app-gray-700"
        }
        ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        ${classNameButton || ""}`}
        style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
      >
        <span className="opacity-0">Loading</span>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative inline-flex w-full">
      {({ open }) => (
        <>
          {selected !== undefined && !isNaN(selected) && (
            <input type="hidden" name={name} value={selected} />
          )}

          <Menu.Button
            ref={setButtonRef}
            className={`flex items-center w-full justify-between border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-base py-2 px-3 ${radiusClassOrStyle || ""} bg-white min-w-[11rem]
            ${
              error
                ? "border-alert-error hover:border-alert-error focus:border-alert-error focus:ring-alert-error text-alert-error"
                : "border-app-gray-1-300 hover:border-app-gray-1-300 focus:border-primary-600 focus:ring-primary-600 text-app-gray-700"
            }
            ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            ${classNameButton || ""}`}
            style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
            aria-label="Select option"
            disabled={disabled}
          >
            <span className="flex items-center">
              <span className={selected === undefined ? "text-slate-400" : ""}>
                {selectedOption?.value ?? placeholder ?? "Selecciona una opción"}
              </span>
            </span>

            <svg
              className="shrink-0 ml-1 fill-current text-inherit"
              width="11"
              height="7"
              viewBox="0 0 11 7"
            >
              <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
            </svg>
          </Menu.Button>

          {!disabled && (
            <PortalLayer enabled={float} open={open} rect={anchorRect}>
            <Transition
              as="div"
              className={`${classNamePopover || ""} ${
                float
                  ? "relative w-full"
                  : `z-[60] absolute ${
                      popoverPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                    } origin-top right-0 w-full`
              } ${radiusClassOrStyle || ""} bg-white border border-app-gray-1-300 shadow-lg overflow-hidden`}
              style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
              enter="transition ease-out duration-100 transform"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="font-normal text-sm text-app-gray-700 focus:outline-none">
                {/* SEARCH */}
                <div className="px-3 py-2 border-b border-app-gray-1-200">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown" || e.key === "ArrowUp") return;
                        e.stopPropagation();
                      }}
                    placeholder="Buscar..."
                    className="w-full rounded-md border border-app-gray-1-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* OPTION TO CLEAR */}
                <div className="divide-y divide-app-gray-1-200 overflow-auto max-h-60">
                  <Menu.Item key="none">
                    {({ active }) => (
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer text-left hover:bg-primary-50
                          ${active ? "bg-slate-50" : ""}
                          ${selected === undefined && "text-primary-700"}`}
                        onClick={handleClearOption}
                        onKeyDown={(e) => e.key === "Enter" && handleClearOption()}
                      >
                        <span className="truncate text-slate-400">
                          -- Ninguna opción --
                        </span>
                      </button>
                    )}
                  </Menu.Item>

                  {/* OPTIONS */}
                  {filteredOptions.map((option, idx) => (
                    <Menu.Item key={`${option.id}-${idx}`}>
                      {({ active }) => (
                        <button
                          type="button"
                          className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer text-left hover:bg-primary-50
                          ${active ? "bg-slate-50" : ""} 
                          ${option.id === selected && "text-primary-700"}`}
                          onClick={() => handleSelectOption(option)}
                          onKeyDown={(e) => e.key === "Enter" && handleSelectOption(option)}
                        >
                          <span className={wrapText ? "whitespace-normal break-words" : "truncate"}>
                            {option.value}
                          </span>

                          <svg
                            className={`shrink-0 mr-2 fill-current text-primary-700 ${
                              option.id !== selected && "invisible"
                            }`}
                            width="12"
                            height="9"
                            viewBox="0 0 12 9"
                          >
                            <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                          </svg>
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
            </PortalLayer>
          )}
        </>
      )}
    </Menu>
  );
}