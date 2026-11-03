"use client";

import { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";

const defaultOptions = [
  { id: 0, value: "Most Popular" },
  { id: 1, value: "Newest" },
  { id: 2, value: "Lowest Price" },
  { id: 3, value: "Highest Price" },
  { id: 4, value: "This is a big text so what happen with this one" },
];

export default function DropdownFull({
  classNameButton,
  classNamePopover,

  popoverPosition = "top",
  onSelect, //Ejemplo para obtener el value mediante una función
  name, //el name es necesario si se quiere obtener mediante el evento onSubmit del form
  options = defaultOptions,
  disable = false,
  defaultValue,
  selectedId,
}: {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: "top" | "bottom";
  onSelect?: (value: number) => void;
  name?: string;
  options?: { id: number; value: string }[];
  defaultValue?: number;
  disable?: boolean;
  selectedId?: number; //
}) {
  const [selected, setSelected] = useState<number>(() => {
    if (selectedId !== undefined) return selectedId;
    if (defaultValue !== undefined) return defaultValue;
    if (options.length > 0) return options[0].id;
    return 0;
  });

  // Actualizar `selected` cuando `defaultValue` cambie

  useEffect(() => {
    if (selectedId !== undefined && selectedId !== selected) {
      setSelected(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId !== undefined) {
      setSelected(selectedId);
    }
  }, [selectedId]);

  return (
    <Menu as="div" className="relative inline-flex w-full">
      {({ open }) => (
        <>
          {/* Input hidden para enviar el valor seleccionado en el formulario */}
          <input type="hidden" name={name} value={selected ?? 0} />
          <Menu.Button
            disabled={disable}
            className={`${classNameButton} btn w-full justify-between min-w-[11rem] rounded-[20px] bg-white dark:bg-slate-800/30 border-app-gray-300 dark:border-slate-700 hover:border-app-gray-400 dark:hover:border-slate-600 text-app-gray-700 hover:text-app-gray-800 dark:text-slate-300 dark:hover:text-slate-200`}
            aria-label="Select option"
          >
            <span className="flex items-center">
              <span>
                {options.find((option) => option.id === selected)?.value ??
                  "Selecciona una opción"}
              </span>
            </span>
            {!disable && (
              <svg
                className="shrink-0 ml-1 fill-current text-inherit"
                width="11"
                height="7"
                viewBox="0 0 11 7"
              >
                <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
              </svg>
            )}
          </Menu.Button>
          <Transition
            as="div"
            className={`${classNamePopover} z-10 absolute ${
              popoverPosition == "top" ? "top-full" : "bottom-full"
            } right-0 w-full rounded-[20px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 shadow-lg overflow-hidden mt-1`}
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Menu.Items className="font-normal text-sm text-app-gray-700 dark:text-slate-300 divide-y divide-app-gray-200 dark:divide-slate-700 focus:outline-none overflow-auto max-h-60">
              {options.map((option, optionIndex) => (
                <Menu.Item key={optionIndex}>
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
                        {
                          onSelect && onSelect(option.id);
                        }
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
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}