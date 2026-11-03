'use client';

import Icon from "@/gcm-bisp/components/ui/Icon";
import useClock from "@/gcm-bisp/components/hooks/useClock";

interface WelcomeBannerProps {
  userName?: string;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const now = useClock();

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-primary-800 to-primary-600 p-6 text-white font-poppins">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-[-60px] h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-primary-100" suppressHydrationWarning>{greeting()}{userName ? `, ${userName}` : ""} 👋</p>
          <h1 className="text-2xl font-bold">Bienvenido a GCM Process BISP</h1>
          <p className="mt-1 text-sm text-primary-100 max-w-2xl">
            Esta pantalla explica la arquitectura del proyecto: estructura por feature, interceptores HTTP para las
            acciones y los componentes del sistema. Úsala como guía al crear una pantalla nueva.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[12px] bg-white/10 px-4 py-2 text-sm">
          <Icon name="Clock" size={16} />
          <span suppressHydrationWarning>
            {now.toLocaleDateString("es-HN", { weekday: "long", day: "2-digit", month: "long" })} ·{" "}
            {now.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}
