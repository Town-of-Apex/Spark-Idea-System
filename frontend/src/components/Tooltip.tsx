"use client";
import { ReactNode } from "react";

export default function Tooltip({ children, text }: { children: ReactNode; text: string }) {
  return (
    <div className="relative group/tooltip inline-flex w-full sm:w-auto">
      {children}
      <div className="absolute bottom-full left-0 mb-2 z-50 w-max max-w-xs scale-95 opacity-0 invisible group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 ease-out bg-stone-800 text-white text-[13px] px-3 py-2 rounded-md shadow-lg pointer-events-none">
        {text}
      </div>
    </div>
  );
}
