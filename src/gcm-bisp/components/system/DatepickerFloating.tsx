'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Hook, Options } from 'flatpickr/dist/types/options';
import { Spanish } from 'flatpickr/dist/l10n/es';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

export default function DatepickerFloating({
  align,
  mode,
  required = false,
  name,
  error = false,
  className = '',
  defaultDateSelected,
  value,
  dateFormat = 'Y-m-d',
  onChangeDate,
}: {
  align?: 'left' | 'right';
  mode?: 'single' | 'range' | 'multiple' | 'time';
  error?: boolean;
  className?: string;
  defaultDateSelected?: Date | string | (Date | string)[];
  value?: Date | string | (Date | string)[];
  dateFormat?: string;
  name?: string;
  required?: boolean;
  onChangeDate?: (selectedDates: Date[], dateStr: string) => void;
}) {
  const placement = align === 'right' ? 'bottom-end' : 'bottom-start';

  const inputRef = useRef<HTMLInputElement | null>(null);
  const calRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const { refs, x, y, strategy } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      // sin size(): queremos tamaño nativo y sin scroll
    ],
  });

  useEffect(() => {
    if (inputRef.current) refs.setReference(inputRef.current);
  }, [refs]);

  useEffect(() => {
    if (calRef.current) refs.setFloating(calRef.current);
  }, [refs, open]);

  // Aplica posición y limpia cualquier scroll/tamaño forzado
  useEffect(() => {
    if (!open || !calRef.current) return;
    const el = calRef.current;
    el.style.position = strategy; // 'fixed'
    el.style.top = `${Math.round(y ?? 0)}px`;
    el.style.left = `${Math.round(x ?? 0)}px`;
    el.style.right = '';
    el.style.bottom = '';
    el.style.transform = 'none';
    el.style.margin = '0';
    el.style.zIndex = '50';

    // sin scroll interno y tamaño natural
    el.style.overflow = 'visible';
    el.style.maxHeight = '';
    el.style.minWidth = '';
    el.style.width = ''; // deja el ancho por defecto de Flatpickr

    // estética (opcional)
    el.style.outline = '0';
    el.style.borderRadius ||= '12px';
    el.style.boxShadow ||= '0 10px 25px rgba(0,0,0,0.08)';
  }, [open, x, y, strategy]);

  // ---- Flatpickr hooks
  const onReady: Hook = (_selectedDates, dateStr, instance) => {
    inputRef.current = instance._input as HTMLInputElement;
    calRef.current = instance.calendarContainer as HTMLElement;

    refs.setReference(inputRef.current);
    refs.setFloating(calRef.current);

    const customClass = align ?? '';
    calRef.current.classList.add(`flatpickr-${customClass}`);

    // Asegura tamaño/scroll nativos desde el inicio
    calRef.current.style.overflow = 'visible';
    calRef.current.style.maxHeight = '';
    calRef.current.style.minWidth = '';
    calRef.current.style.width = '';
  };
  const normalizeValue = (
    val?: Date | string | (Date | string)[]
  ): Date | Date[] | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      return val.map((v) => (typeof v === 'string' ? new Date(v) : v));
    }
    return typeof val === 'string' ? new Date(val) : val;
  };
  const onChange: Hook = (selectedDates, dateStr, instance) => {
    onChangeDate?.(selectedDates, dateStr);
  };

  const onOpen: Hook = (_d, _s, instance) => {
    calRef.current = instance.calendarContainer as HTMLElement;
    setOpen(true);

    if (calRef.current) {
      // Evita re-posicionamientos propios
      calRef.current.style.transform = 'none';
      calRef.current.style.willChange = 'transform';

      // sin scroll y tamaño natural cada vez que abre
      calRef.current.style.overflow = 'visible';
      calRef.current.style.maxHeight = '';
      calRef.current.style.minWidth = '';
      calRef.current.style.width = '';
    }
  };

  const onClose: Hook = () => setOpen(false);

  const options: Options = useMemo(
    () => ({
      mode,
      static: false, // popup fuera del flujo
      monthSelectorType: 'static',
      disableMobile: true,
      dateFormat,
      locale: { ...Spanish },
      prevArrow:
        '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow:
        '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
      onReady,
      onChange,
      onOpen,
      onClose,
      appendTo:
        typeof document !== 'undefined'
          ? (document.body as HTMLElement)
          : undefined,
    }),
    [mode, dateFormat]
  );

  return (
    <div className={`relative ${className}`}>
      <Flatpickr
        className='form-input pl-9 rounded-[10px] border-app-gray-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 dark:hover:text-slate-200 font-normal text-sm w-[15.5rem] outline-none focus:outline-none'
        options={options}
        name={name}
        required={required}
        value={normalizeValue(value)}
      />

      <div className='absolute inset-0 right-auto flex items-center pointer-events-none'>
        <svg
          className={`w-4 h-4 fill-current ${
            error ? 'text-danger' : 'text-app-gray-400'
          } dark:text-slate-400 ml-3`}
          viewBox='0 0 16 16'
        >
          <path d='M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z' />
        </svg>
      </div>
    </div>
  );
}