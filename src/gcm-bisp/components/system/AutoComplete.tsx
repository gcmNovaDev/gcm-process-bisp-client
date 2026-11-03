import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoCompleteOption {
  id: number;
  value: string;
}

interface AutoCompleteProps {
  options: AutoCompleteOption[];
  selectedValue: number | null;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number | null,
    value: string | null
  ) => void;

  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  options,
  selectedValue,
  onChange,
  placeholder = 'Selecciona una opción...',
  disabled = false,
  className,
  name,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState<AutoCompleteOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedValue !== null) {
      const selected = options.find((o) => o.id === selectedValue);
      if (selected) setInputValue(selected.value);
    } else {
      setInputValue('');
    }
  }, [selectedValue, options]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const filteredOptions = options.filter((o) =>
      o.value.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFiltered(filteredOptions);
  }, [inputValue, options]);

  const handleSelect = (option: AutoCompleteOption) => {
    setInputValue(option.value);
    const syntheticEvent = {
      target: inputRef.current!,
      currentTarget: inputRef.current!,
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent, option.id, option.value);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    const syntheticEvent = {
      target: inputRef.current!,
      currentTarget: inputRef.current!,
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent, null, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0]);
    }
  };

  return (
    <div
      className={cn('relative w-full', className)}
      ref={wrapperRef}
      style={{ colorScheme: 'light' }}
    >
      <div className='relative'>
        <Search
          size={16}
          className='absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        {inputValue && !disabled && (
          <button
            type='button'
            className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground'
            onClick={handleClear}
          >
            <X size={16} />
          </button>
        )}
        <input
          type='text'
          ref={inputRef}
          name={name}
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          style={{ colorScheme: 'light' }}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e, null, null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full h-10 px-8 pr-8 rounded-[10px] border border-input text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:border-gray-400',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className='absolute z-50 mt-1 w-full bg-popover border border-border rounded-[10px] shadow-md max-h-60 overflow-y-auto'>
          {filtered.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className='cursor-pointer px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
            >
              {option.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};