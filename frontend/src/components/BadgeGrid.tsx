"use client";
import React from "react";
import BadgeIcon from "./BadgeIcon";

interface Badge {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon: string;
  achieved_at?: string;
}

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div 
          key={badge.id}
          className={`flex flex-col items-center p-6 rounded-xl border transition-all duration-300 ${
            badge.achieved 
              ? "bg-white border-teal/20 shadow-sm shadow-teal/5" 
              : "bg-surface/50 border-line opacity-80"
          }`}
        >
          <div className={`p-4 rounded-full mb-4 ${
            badge.achieved ? "bg-teal/10 text-teal" : "bg-inner text-rosy"
          }`}>
            <BadgeIcon name={badge.icon} size={32} grayscale={!badge.achieved} />
          </div>
          <h3 className={`text-sm font-bold text-center mb-1 ${badge.achieved ? "text-stone-800" : "text-rosy"}`}>
            {badge.name}
          </h3>
          <p className="text-[11px] text-rosy text-center leading-tight">
            {badge.description}
          </p>
          {badge.achieved && badge.achieved_at && (
            <div className="mt-4 pt-3 border-t border-line/30 w-full text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-teal/60">
                Unlocked {new Date(badge.achieved_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
