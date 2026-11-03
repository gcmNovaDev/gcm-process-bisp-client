"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, Transition } from "@headlessui/react";

const defaultOptions = [
  { id: 0, value: "Most Popular" },
  { id: 1, value: "Newest" },
  { id: 2, value: "Lowest Price" },
  { id: 3, value: "Highest Price" },
  { id: 4, value: "This is a big text so what happen with this one" },
];

type Option = { id: number; value: string };

export default function DropdownFull4({
  classNameButton,
  classNamePopover,
  popoverPosition = "top",
  onSelect,
  name,
  options = defaultOptions,
  defaultValue,
  disabled = false,
  error = false,
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
}) {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const optionsMap = useMemo(() => {
    const m = new Map<number, string>();
    (options || []).forEach((o) => m.set(Number(o.id), o.value));
    return m;
  }, [options]);

  useEffect(() => {
    // caso 1: backend manda valor
    if (defaultValue !== undefined && defaultValue !== null) {
      const dv = Number(defaultValue);
      setSelected(dv);
      return;
    }
    // caso 2: no hay defaultValue -> selecciona el primero
    if ((options || []).length > 0) {
      setSelected(Number(options[0].id));
    } else {
      setSelected(undefined);
    }
  }, [defaultValue, options]);

  // selectedOption (si no existe en options aún, mostramos placeholder)
  const selectedOption = useMemo(() => {
    if (selected === undefined || Number.isNaN(Number(selected))) return undefined;
    return (options || []).find((o) => Number(o.id) === Number(selected));
  }, [options, selected]);



  return (
    <Menu as="div" className="relative inline-flex w-full">
      {({ open }) => (
        <>
          {selected !== undefined && !Number.isNaN(Number(selected)) && (
            <input type="hidden" name={name} value={selected} />
          )}

          <Menu.Button
            className={`${classNameButton} btn w-full justify-between min-w-[11rem] rounded-[20px]
              bg-white dark:bg-slate-800/30 
              ${
                error
                  ? "border-red-500 text-red-600 focus:ring-red-500"
                  : "border-app-gray-300 dark:border-slate-700 text-app-gray-700"
              }
              hover:border-app-gray-400 dark:hover:border-slate-600
              ${disabled ? "pointer-events-none opacity-50 cursor-not-allowed" : ""}
            `}
            aria-label="Select option"
            disabled={disabled}
          >
            <span className="flex items-center">
              <span>
                {selectedOption?.value ??
                  (selected !== undefined && optionsMap.get(Number(selected))) ??
                  "Selecciona una opción"}
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
            <Transition
              as="div"
              className={`${classNamePopover} z-10 absolute ${
                popoverPosition === "top" ? "top-full" : "bottom-full"
              } right-0 w-full rounded-[20px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 shadow-lg overflow-hidden mt-1`}
              enter="transition ease-out duration-100 transform"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="font-normal text-sm text-app-gray-700 dark:text-slate-300 divide-y divide-app-gray-200 dark:divide-slate-700 focus:outline-none overflow-auto max-h-60">
                {(options || []).map((option) => (
                  <Menu.Item key={option.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer hover:bg-primary-50 hover:dark:bg-slate-700 ${
                          active ? "bg-slate-50 dark:bg-slate-700/20" : ""
                        } ${
                          Number(option.id) === Number(selected) &&
                          "text-primary-700 dark:text-indigo-500"
                        }`}
                        onClick={() => {
                          onSelect?.(Number(option.id), option.value);
                          setSelected(Number(option.id));
                        }}
                      >
                        <span>{option.value}</span>
                        <svg
                          className={`shrink-0 mr-2 fill-current text-primary-700 dark:text-indigo-500 ${
                            Number(option.id) !== Number(selected) && "invisible"
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
          )}
        </>
      )}
    </Menu>
  );
}