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
  const width = Math.min(Math.max(rect.width, 176), window.innerWidth - 16);
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
        zIndex: 9000,
        transform: "translateY(-100%)",
      }
    : { position: "fixed", top: rect.bottom + 4, left, width, zIndex: 9000 };

  return createPortal(<div style={style}>{children}</div>, document.body);
}

const defaultOptions = [
  { id: 0, value: "Most Popular" },
  { id: 1, value: "Newest" },
  { id: 2, value: "Lowest Price" },
  { id: 3, value: "Highest Price" },
  { id: 4, value: "This is a big text so what happen with this one" },
];

export default function DropdownFull2({
  classNameButton,
  classNamePopover,
  popoverPosition = "top",
  onSelect,
  name,
  options = defaultOptions,
  defaultValue,
  disabled = false,
  error = false, 
  radius = "md",
  placeholder,
  portal = false,
}: {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: "top" | "bottom";
  onSelect?: (value: number, key?: string) => void;
  name?: string;
  options?: { id: number; value: string }[];
  defaultValue?: number;
  disabled?: boolean;
  error?: boolean;
  radius?: "sm" | "md" | "lg" | "full" | string;
  placeholder?: string;
  portal?: boolean;
}) {
  const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const radiusClassOrStyle = radiusClasses[radius as keyof typeof radiusClasses]
    ? radiusClasses[radius as keyof typeof radiusClasses]
    : undefined;
  const [selected, setSelected] = useState<number | undefined>(
    defaultValue !== undefined
      ? defaultValue
      : placeholder
      ? undefined
      : options.length > 0
      ? options[0].id
      : undefined
  );

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const selectedOption = options.find((o) => o.id === selected);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const anchorElRef = useRef<HTMLButtonElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = anchorElRef.current;
    setAnchorRect(el ? el.getBoundingClientRect() : null);
  }, []);

  const setButtonRef = useCallback((node: HTMLButtonElement | null) => {
    anchorElRef.current = node;
    setAnchorRect(node ? node.getBoundingClientRect() : null);
  }, []);

  useEffect(() => {
    if (!portal) return;
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [portal, measure]);

  if (!mounted) {
    return (
      <div 
        className={`flex items-center w-full justify-between border text-base py-2 px-3 ${radiusClassOrStyle || ""} bg-white min-w-0 sm:min-w-[11rem] ${
          error ? "border-alert-error text-alert-error" : "border-app-gray-1-300 text-app-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${classNameButton || ""}`}
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
            className={`flex items-center w-full justify-between border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-base py-2 px-3 ${radiusClassOrStyle || ""} bg-white min-w-0 sm:min-w-[11rem] ${
              error
                ? "border-alert-error hover:border-alert-error focus:border-alert-error focus:ring-alert-error text-alert-error"
                : "border-app-gray-1-300 hover:border-app-gray-1-300 focus:border-primary-600 focus:ring-primary-600 text-app-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${classNameButton || ""}`}
            style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
            aria-label="Select option"
            disabled={disabled}
          >
            <span className="flex items-center">
              <span className={selected === undefined ? 'text-slate-400' : ''}>
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
            <PortalLayer enabled={portal} open={open} rect={anchorRect}>
            <Transition
              as="div"
              className={`${classNamePopover || ''} ${portal ? "relative w-full" : "z-[60] absolute top-full mt-1 origin-top right-0 w-full"} ${radiusClassOrStyle || ""} bg-white border border-app-gray-1-300 py-1.5 shadow-lg overflow-y-auto`}
              style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
              enter="transition ease-out duration-100 transform"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="font-normal text-sm text-app-gray-700 divide-y divide-app-gray-1-200 focus:outline-none overflow-y-auto max-h-60">
                {options.map((option) => (
                  <Menu.Item key={option.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer text-left hover:bg-primary-50 ${
                          active ? "bg-slate-50" : ""
                        } ${
                          option.id === selected &&
                          "text-primary-700"
                        }`}
                        onClick={() => {
                          onSelect?.(option.id, option.value);
                          setSelected(option.id);
                        }}
                      >
                        <span className="truncate">{option.value}</span>
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
              </Menu.Items>
            </Transition>
            </PortalLayer>
          )}
        </>
      )}
    </Menu>
  );
}