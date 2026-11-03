"use client";

import * as Icons from "lucide-react";
import { ElementType } from "react";
import { AlertCircle } from "lucide-react";

export type IconName = keyof typeof Icons;

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 20, className }: IconProps) {
  const LucideIcon = (Icons as any)[name] as ElementType | undefined;
  const IconToRender = LucideIcon ?? AlertCircle;
  return <IconToRender size={size} className={className} />;
}