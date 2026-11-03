import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite que otros orígenes (ej. IP local) consuman recursos de /_next en modo de desarrollo.
  // Reemplaza el puerto si usas uno distinto (este proyecto usa 3008).
  allowedDevOrigins: [
    "http://10.0.0.97:3008",
    "http://10.0.0.231:8082",
    "http://localhost:3008"
  ],
};

export default nextConfig;
