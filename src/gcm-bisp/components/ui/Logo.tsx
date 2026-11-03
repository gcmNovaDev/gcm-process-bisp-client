"use client";

import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  clickable?: boolean;
  adjustToContainer?: boolean;
}

export default function Logo({ size = 40, className, withText = false, clickable = true, adjustToContainer = false }: LogoProps) {
  const imgClassName = adjustToContainer ? `${className || ''} w-full h-full object-contain`.trim() : className;

  const logoContent = (
    <>
      <img
        src="/Logo/Logo_GCM_Process.png"
        alt="GCM Process BISP Logo"
        {...(adjustToContainer ? {} : { width: size, height: size })}
        className={imgClassName}
      />

      {withText && (
        <span className="font-bold text-lg text-gray-700">GCM Process BISP</span>
      )}
    </>
  );

  if (clickable) {
    return (
      <Link href="/gcm-bisp/dashboard" className="flex items-center gap-2">
        {logoContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {logoContent}
    </div>
  );
}