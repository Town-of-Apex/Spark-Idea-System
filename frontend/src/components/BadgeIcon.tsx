"use client";
import React from "react";
import * as Lucide from "lucide-react";

interface BadgeIconProps {
  name: string;
  size?: number;
  className?: string;
  grayscale?: boolean;
}

export default function BadgeIcon({ name, size = 24, className = "", grayscale = false }: BadgeIconProps) {
  // @ts-ignore
  const Icon = Lucide[name] || Lucide.HelpCircle;
  
  return (
    <div className={`${className} ${grayscale ? "grayscale opacity-40" : "grayscale-0 opacity-100"} transition-all duration-500`}>
      <Icon size={size} strokeWidth={2.5} />
    </div>
  );
}
