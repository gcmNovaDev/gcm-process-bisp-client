"use client";

import { useEffect } from "react";

export default function AuthPage() {
  const platformOrigin = process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || "http://localhost:3001";
  const platformLoginUrl = platformOrigin.endsWith('/') 
    ? `${platformOrigin}Auth/Login` 
    : `${platformOrigin}/Auth/Login`;

  useEffect(() => {
    window.location.href = platformLoginUrl;
  }, [platformLoginUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Redirigiendo al sistema de acceso central...</p>
      </div>
    </div>
  );
}