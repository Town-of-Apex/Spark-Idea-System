"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@apexnc.org")) {
      setError("Please enter a valid @apexnc.org email address.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, displayName);
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    }
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-line/20 overflow-hidden p-10 space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif text-stone-800 tracking-tight">Welcome to Spark</h1>
            <p className="text-sm font-bold text-teal uppercase tracking-widest">Apex Idea Marketplace</p>
        </div>

        {error && (
            <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl text-gold text-xs font-bold animate-pulse">
                {error}
            </div>
        )}

        {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-rosy tracking-widest px-1">Apex Work Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@apexnc.org"
                        className="w-full p-4 rounded-xl bg-canvas/50 border border-line/20 focus:outline-none focus:ring-2 focus:ring-teal transition-all text-stone-800"
                        required
                        autoFocus
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-[0.98]"
                >
                    Continue
                </button>
                <p className="text-[10px] text-center text-rosy italic">
                    Demo Mode &mdash; No password required.
                </p>
            </form>
        ) : (
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-rosy tracking-widest px-1">What should we call you? (Optional)</label>
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Connor M."
                        className="w-full p-4 rounded-xl bg-canvas/50 border border-line/20 focus:outline-none focus:ring-2 focus:ring-teal transition-all text-stone-800"
                        autoFocus
                    />
                </div>
                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-canvas text-rosy rounded-xl font-bold hover:bg-line transition-all"
                    >
                        Back
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-4 bg-teal text-white rounded-xl font-bold hover:bg-[#286051] transition-all shadow-lg shadow-teal/20"
                    >
                        Enter Marketplace
                    </button>
                </div>
            </form>
        )}
      </div>
    </main>
  );
}
