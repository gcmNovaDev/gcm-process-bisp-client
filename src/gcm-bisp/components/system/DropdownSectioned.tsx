"use client";

import { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";

type OptionItem = {
  id: number;
  value: string;
};

type OptionSection = {
  title: string;
  items: OptionItem[];
};

type DropdownMultiSectionProps = {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: "top" | "bottom";
  onSelect?: (id: number, label?: string) => void;
  name?: string;
  options?: OptionSection[];
  defaultValue?: number;
  disabled?: boolean;
};

export default function DropdownMultiSection({
  classNameButton,
  classNamePopover,
  popoverPosition = "top",
  onSelect,
  name,
  options = [],
  defaultValue,
  disabled = false,
}: DropdownMultiSectionProps) {
  const [selected, setSelected] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelected(defaultValue);
    } else if (options.length > 0) {
      const first = options[0]?.items?.[0];
      if (first) setSelected(first.id);
    }
  }, [defaultValue, options]);

  const selectedOption = options
    .flatMap((section) => section.items)
    .find((o) => o.id === selected);

  return (
    <Menu as="div" className="relative inline-flex w-full">
      {({ open }) => (
        <>
          {selected !== undefined && !isNaN(selected) && (
            <input type="hidden" name={name} value={selected} />
          )}

          <Menu.Button
            className={`${classNameButton} btn w-full justify-between min-w-[11rem] rounded-[20px] bg-white dark:bg-slate-800/30 border-app-gray-300 dark:border-slate-700 hover:border-app-gray-400 dark:hover:border-slate-600 text-app-gray-700 hover:text-app-gray-800 dark:text-slate-300 dark:hover:text-slate-200 ${
              disabled
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : ""
            }`}
            aria-label="Select option"
            disabled={disabled}
          >
            <span className="flex items-center">
              <span>{selectedOption?.value ?? "Selecciona una opción"}</span>
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
              <Menu.Items className="font-normal text-sm text-app-gray-700 dark:text-slate-300 focus:outline-none overflow-auto max-h-60">
                {options.map((section, idx) => (
                  <div key={idx} className="py-1">
                    <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                      {section.title}
                    </div>
                    {section.items.map((option) => (
                      <Menu.Item key={option.id}>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer hover:bg-primary-50 hover:dark:bg-slate-700 ${
                              active ? "bg-slate-50 dark:bg-slate-700/20" : ""
                            } ${
                              option.id === selected &&
                              "text-primary-700 dark:text-indigo-500"
                            }`}
                            onClick={() => {
                              onSelect?.(option.id, option.value);
                              setSelected(option.id);
                            }}
                          >
                            <span>{option.value}</span>
                            <svg
                              className={`shrink-0 mr-2 fill-current text-primary-700 dark:text-indigo-500 ${
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
                ))}
              </Menu.Items>
            </Transition>
          )}
        </>
      )}
    </Menu>
  );
}