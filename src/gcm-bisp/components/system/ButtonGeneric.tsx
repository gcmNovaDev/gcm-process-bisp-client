// src/gcm-bisp/components/system/ButtonGeneric.tsx
import React from 'react'

export interface ButtonGenericProps {
  size?: 'sm' | 'md' | 'lg'
  name: string | React.ReactNode
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'neutral' | 'success' | 'custom'
  radius?: 'sm' | 'md' | 'lg' | 'full' | string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  classNameButton?: string
  type?: 'button' | 'submit'
  tooltip?: string | boolean
}

export const ButtonGeneric: React.FC<ButtonGenericProps> = ({
  size = 'sm',
  name = 'Button',
  disabled = false,
  onClick = () => {},
  variant = 'primary',
  radius = 'md',
  icon,
  iconPosition = 'left',
  classNameButton,
  type = 'button',
  tooltip,
  ...props
}) => {
  // Clases base
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Tamaños
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Variantes
  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus:ring-secondary-500',
    outline:
      'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-500',
    danger:
      'bg-alert-error text-white border-alert-error hover:bg-red-700 hover:border-red-700 active:bg-red-800 focus:ring-alert-error',
    neutral:
      'bg-alert-neutral text-white border-alert-neutral hover:bg-gray-400 hover:border-gray-400 active:bg-gray-500 focus:ring-alert-neutral',
    success:
      'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
    custom: '',
  }

  // Border radius predefinidos de Tailwind
  const radiusClassesMap: Record<string, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  // Detectamos si radius es predefinido o valor arbitrario
  const radiusClasses = radiusClassesMap[radius] || '' // si es predefinido usamos la clase Tailwind
  const radiusStyle = !radiusClasses ? { borderRadius: radius } : {} // si no, usamos inline style

  const buttonContent = (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        radiusClasses
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${classNameButton || ''}`}
      style={radiusStyle} // aplica el valor arbitrario si existe
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center justify-center">{icon}</span>
      )}
      {name}
      {icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center justify-center">{icon}</span>
      )}
    </button>
  )

  if (tooltip) {
    const tooltipText = tooltip === true ? "No tienes permisos" : tooltip
    return (
      <div className={`relative inline-flex group/tooltip ${classNameButton?.includes('w-full') ? 'w-full' : ''}`}>
        {buttonContent}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block whitespace-nowrap bg-slate-800 text-white text-xs font-medium rounded py-1.5 px-3 z-50 pointer-events-none shadow-sm transition-opacity duration-200">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    )
  }

  return buttonContent
}

export default ButtonGeneric