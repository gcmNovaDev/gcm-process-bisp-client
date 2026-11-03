// src/gcm-bisp/components/system/InputGeneric.tsx
import React from 'react'

export interface InputGenericProps {
  size?: 'sm' | 'md' | 'lg'
  name: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onChangeNumber?: (value: number | undefined) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  type?: 'text' | 'number' | 'email' | 'password' | 'search'
  disabled?: boolean
  error?: string | boolean
  classNameInput?: string
  radius?: 'sm' | 'md' | 'lg' | 'full' | string
  autoComplete?: string
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  autoCorrect?: string
  spellCheck?: boolean
  step?: string | number
}

export const InputGeneric: React.FC<InputGenericProps> = ({
  size = 'md',
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  onChangeNumber,
  onKeyDown,
  type = 'text',
  disabled = false,
  error = false,
  classNameInput,
  radius = 'md',
  autoComplete,
  inputMode,
  autoCorrect,
  spellCheck,
  step,
}) => {
  // Base
  const baseClasses =
    'form-input w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'

  // Tamaños
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-3 px-4',
  }

  // Border radius predefinido
  const radiusClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  // ✅ Decidir si es controlado o no
  const inputProps =
    value !== undefined
      ? { value }
      : { defaultValue }

  // Clases de error / normal
  const errorClasses = error
    ? 'border-alert-error hover:border-alert-error focus:border-alert-error focus:ring-alert-error'
    : 'border-app-gray-1-300 hover:border-app-gray-1-300 focus:border-primary-600 focus:ring-primary-600'

  // Determinar el border-radius final
  const radiusClassOrStyle = radiusClasses[radius as keyof typeof radiusClasses]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);

    if (onChangeNumber) {
      const raw = e.target.value;
      if (raw === '' || raw === '-') {
        onChangeNumber(undefined);
      } else {
        const num = parseFloat(raw);
        onChangeNumber(isNaN(num) ? undefined : num);
      }
    }

  };

  return (
    <div className="flex flex-col gap-1">
      <input
        {...inputProps}
        type={type}
        name={name}
        id={name}
        className={`${baseClasses} ${sizeClasses[size]} ${radiusClassOrStyle || ''} ${errorClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${classNameInput || ''}`}
        style={radiusClassOrStyle ? undefined : { borderRadius: radius }}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        step={step}
      />
      {typeof error === 'string' && (
        <span className="text-alert-error text-sm">{error}</span>
      )}
    </div>
  )
}

export default InputGeneric