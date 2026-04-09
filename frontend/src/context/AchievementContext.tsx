"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import BadgeIcon from "@/components/BadgeIcon";
import confetti from "canvas-confetti";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  notified: boolean;
}

interface AchievementContextType {
  checkNewAchievements: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const API_URL = "http://localhost:8000";

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const checkNewAchievements = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/me/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter those that achieved but not notified
        const unnotified = data.badges.filter((b: any) => b.achieved && !b.notified);
        if (unnotified.length > 0) {
          setQueue(prev => [...prev, ...unnotified]);
        }
      }
    } catch (err) {
      console.error("Failed to check achievements", err);
    }
  }, [token]);

  // Handle queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);
      setQueue(prev => prev.slice(1));
      
      // Trigger confetti
      triggerConfetti();
      
      // Auto-acknowledge after a delay or when closed
    }
  }, [queue, current]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const acknowledge = async (id: string) => {
    try {
      await fetch(`${API_URL}/users/me/achievements/${id}/ack`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to acknowledge achievement", err);
    }
  };

  const closeCurrent = () => {
    if (current) {
      acknowledge(current.id);
      setCurrent(null);
    }
  };

  // Check on initial load if user exists
  useEffect(() => {
    if (user) {
      checkNewAchievements();
    }
  }, [user]);

  return (
    <AchievementContext.Provider value={{ checkNewAchievements }}>
      {children}
      
      {/* Achievement Popup */}
      {current && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-teal/20 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-500 delay-100">
            <div className="bg-teal p-8 flex justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white ring-4 ring-white/10 animate-bounce">
                <BadgeIcon name={current.icon} size={40} />
              </div>
            </div>
            <div className="p-8 text-center">
              <p className="text-[10px] font-bold text-teal tracking-widest uppercase mb-2">New Achievement Unlocked!</p>
              <h2 className="text-3xl font-serif text-stone-800 mb-4">{current.name}</h2>
              <p className="text-rosy text-sm leading-relaxed mb-8">{current.description}</p>
              
              <button 
                onClick={closeCurrent}
                className="w-full bg-teal text-white font-bold py-3 rounded-lg hover:bg-teal-dark transition-all scale-100 active:scale-95"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementProvider");
  }
  return context;
}
