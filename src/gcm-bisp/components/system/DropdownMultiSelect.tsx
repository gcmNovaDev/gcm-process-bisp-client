'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';

type OptionType = { id: number; value: string };

export default function DropdownMultiSelect({
  classNameButton,
  classNamePopover,
  popoverPosition = 'top',
  onSelect,
  name,
  options = [],
  defaultValue,
  disable = false,
}: {
  classNameButton?: string;
  classNamePopover?: string;
  popoverPosition?: 'top' | 'bottom';
  onSelect?: (values: number[]) => void;
  name?: string;
  options?: OptionType[];
  defaultValue?: number[];
  disable?: boolean;
}) {
  // Solo usar defaultValue una vez al montar
  const initialized = useRef(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(defaultValue ?? []);

  useEffect(() => {
    if (!initialized.current && defaultValue) {
      setSelectedIds(defaultValue);
      initialized.current = true;
    }
  }, [defaultValue]);

  useEffect(() => {
    onSelect?.(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const displayText =
    selectedIds.length === 0
      ? 'Selecciona una o varias opciones'
      : options
          .filter((opt) => selectedIds.includes(opt.id))
          .map((opt) => opt.value)
          .join(', ');

  return (
    <Menu as="div" className="relative inline-flex w-full">
      {({ open }) => (
        <>
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name={name} value={id} />
          ))}

          <Menu.Button
            disabled={disable}
            className={`${classNameButton} btn w-full justify-between min-w-[11rem] rounded-[20px] bg-white dark:bg-slate-800/30 border-app-gray-300 dark:border-slate-700 hover:border-app-gray-400 dark:hover:border-slate-600 text-app-gray-700 hover:text-app-gray-800 dark:text-slate-300 dark:hover:text-slate-200`}
          >
            <span className="flex items-center truncate">{displayText}</span>
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
              popoverPosition === 'top' ? 'top-full' : 'bottom-full'
            } right-0 w-full rounded-[20px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 shadow-lg overflow-hidden mt-1`}
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Menu.Items className="font-normal text-sm text-app-gray-700 dark:text-slate-300 divide-y divide-app-gray-200 dark:divide-slate-700 focus:outline-none overflow-auto max-h-60">
              {options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <Menu.Item key={option.id}>
                    {({ active }) => (
                      <div
                        className={`flex items-center justify-between w-full py-2 px-3 cursor-pointer hover:bg-primary-50 hover:dark:bg-slate-700 ${
                          active ? 'bg-slate-50 dark:bg-slate-700/20' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSelection(option.id);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <input type="checkbox" checked={isSelected} readOnly />
                          <span>{option.value}</span>
                        </span>
                      </div>
                    )}
                  </Menu.Item>
                );
              })}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}