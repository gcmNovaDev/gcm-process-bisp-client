// src/gcm-bisp/components/system/Badge.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
  radius?: 'sm' | 'md' | 'lg' | 'full' | 'none' | string;
  customColors?: {
    bg?: string;
    border?: string;
    text?: string;
  };
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'primary',
  radius = 'md',
  customColors,
}) => {
  // Clases basadas en la configuración de colores de la alerta y colores en tailwind.config.js
  const variantClasses = {
    primary: 'bg-primary-50 border-primary-200 text-primary-900',
    secondary: 'bg-secondary-50 border-secondary-200 text-secondary-900',
    tertiary: 'bg-tertiary-50 border-tertiary-200 text-tertiary-900',
    accent: 'bg-accent-50 border-accent-200 text-accent-900',
    success: 'bg-alert-success-bg border-alert-success-DEFAULT text-alert-success-text',
    info: 'bg-alert-info-bg border-alert-info-DEFAULT text-alert-info-text',
    warning: 'bg-alert-warning-bg border-alert-warning-DEFAULT text-alert-warning-text',
    error: 'bg-alert-error-bg border-alert-error-DEFAULT text-alert-error-text',
    neutral: 'bg-alert-neutral-bg border-alert-neutral-DEFAULT text-alert-neutral-text',
  } as Record<string, string>;

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const radiusClasses = radiusMap[radius] || '';
  const radiusStyle = !radiusClasses ? { borderRadius: radius } : {};
  
  // Agregar colores personalizados si existen
  const customStyles: React.CSSProperties = { ...radiusStyle };
  if (customColors?.bg) customStyles.backgroundColor = customColors.bg;
  if (customColors?.border) customStyles.borderColor = customColors.border;
  if (customColors?.text) customStyles.color = customColors.text;

  // Si se envían colores personalizados evitamos usar la variante por defecto para que no sobrescriban los text o background de CSS
  const activeVariantClass = customColors ? '' : variantClasses[variant];

  return (
    <div
      className={twMerge(
        'border flex items-center justify-start px-4 py-3 w-full transition-colors',
        activeVariantClass,
        radiusClasses,
        className
      )}
      style={customStyles}
    >
      {children}
    </div>
  );
};

export default Badge;
