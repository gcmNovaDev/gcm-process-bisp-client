"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  useListNavigation,
} from "@floating-ui/react";

type Option = { id: number; value: string };

const defaultOptions: Option[] = [
  { id: 0, value: "Most Popular" },
  { id: 1, value: "Newest" },
  { id: 2, value: "Lowest Price" },
  { id: 3, value: "Highest Price" },
  { id: 4, value: "This is a big text so what happen with this one" },
];

export default function DropdownFull3({
  classNameButton,
  classNamePopover,
  popoverPosition = "top",
  onSelect,
  name,
  options = defaultOptions,
  defaultValue,
  disabled = false,
  customMessage,
  id,
}: {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: "top" | "bottom";
  onSelect?: (value: number, key?: string) => void;
  name?: string;
  options?: Option[];
  defaultValue?: number;
  disabled?: boolean;
  customMessage?: string;
  id?: string;
}) {
  const [selected, setSelected] = useState<number | undefined>(
    defaultValue !== undefined
      ? defaultValue
      : options.length > 0
        ? options[0].id
        : undefined,
  );

  useEffect(() => {
    if (defaultValue !== undefined) setSelected(defaultValue);
  }, [defaultValue]);

  /*   // Si cambian las options y se pierde la opción seleccionada, reajusta
  useEffect(() => {
    if (selected === undefined) return;
    if (!options.some((o) => o.id === selected)) {
      setSelected(options[0]?.id);
    }
  }, [options, selected]); */

  const selectedOption = useMemo(
    () => options.find((o) => o.id === selected),
    [options, selected],
  );

  // ---- Floating UI
  const [open, setOpen] = useState(false);
  const placement = popoverPosition === "top" ? "bottom-start" : "top-start"; // invertimos porque tus clases usaban top/bottom "full"

  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy: "fixed", // evita clipping por overflow/transform
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: "240px",
            overflow: "auto",
          });
        },
      }),
    ],
  });

  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [click, dismiss, role, listNav],
  );

  // ---- handlers
  const handleChoose = (opt: Option) => {
    setSelected(opt.id);
    onSelect?.(opt.id, opt.value);
    setOpen(false);
  };

  return (
    <div className="relative inline-flex w-full">
      {selected !== undefined && !isNaN(selected) && (
        <input type="hidden" name={name} value={selected} id={id} />
      )}

      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="button"
        aria-label="Select option"
        disabled={disabled}
        className={[
          classNameButton ?? "",
          "btn w-full justify-between min-w-[11rem] rounded-[20px]",
          "bg-white ",
          "border-app-gray-300 dark:border-slate-700 hover:border-app-gray-400 dark:hover:border-slate-600",
          "text-app-gray-700 hover:text-app-gray-800 dark:text-slate-300 dark:hover:text-slate-200",
          "focus:outline-none focus:ring-0",
          disabled
            ? "pointer-events-none opacity-50 cursor-not-allowed"
            : "cursor-pointer",
        ].join(" ")}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            setOpen(true);
          }
        }}
      >
        <span className="flex items-center">
          <span>
            {selectedOption?.value ??
              `${customMessage ? customMessage : "Selecciona una opción"}`}
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
      </button>

      <FloatingPortal>
        {open && !disabled && (
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
          >
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={[
                // clases base del popover
                "z-20 rounded-[20px] bg-white dark:bg-slate-800",
                "ring-1 ring-slate-200 dark:ring-slate-700",
                "py-1.5 shadow-lg overflow-hidden mt-1",
                "outline-none focus:outline-none focus-visible:outline-none",
                // extra opcional recibido por prop
                classNamePopover ?? "",
              ].join(" ")}
            >
              <div
                className="font-normal text-sm text-app-gray-700 dark:text-slate-300
                           divide-y divide-app-gray-200 dark:divide-slate-700 focus:outline-none"
                role="listbox"
                aria-activedescendant={
                  activeIndex != null
                    ? `dropdown-opt-${options[activeIndex]?.id}`
                    : undefined
                }
              >
                {options.map((option, i) => (
                  <button
                    key={option.id}
                    id={`dropdown-opt-${option.id}`}
                    ref={(node) => {
                      listRef.current[i] = node;
                    }}
                    {...getItemProps({
                      onClick: () => handleChoose(option),
                      onMouseEnter: () => setActiveIndex(i),
                    })}
                    type="button"
                    role="option"
                    aria-selected={option.id === selected}
                    className={[
                      "flex items-center justify-between w-full py-2 px-3 cursor-pointer",
                      "hover:bg-primary-50 ",
                      "outline-none focus:outline-none focus-visible:outline-none",
                      activeIndex === i
                        ? "bg-slate-50/60 dark:bg-slate-700/20"
                        : "",
                      option.id === selected
                        ? "text-primary-700 dark:text-indigo-500"
                        : "",
                    ].join(" ")}
                  >
                    <span className="truncate">{option.value}</span>
                    <svg
                      className={[
                        "shrink-0 mr-2 fill-current text-primary-700 dark:text-indigo-500",
                        option.id !== selected ? "invisible" : "",
                      ].join(" ")}
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                    >
                      <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </div>
  );
}
