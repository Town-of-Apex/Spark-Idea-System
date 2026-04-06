"use client";
import { useState } from "react";
import PromptHeader from "@/components/PromptHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function Home() {
  const router = useRouter();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleIdeaSubmit = async (text: string, username: string) => {
    try {
      await fetch(`${API_URL}/ideas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, username }),
      });
      
      setIsSubmitted(true);
      
      // Wait a moment for the user to see the success state
      setTimeout(() => {
        router.push("/sparks");
      }, 1500);
      
    } catch (e) {
      console.error("Failed to submit idea", e);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-4xl mx-auto">
      <div className="w-full text-center mb-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-apex-green/10 text-apex-green text-sm font-bold tracking-widest uppercase mb-6 animate-fade-in">
          Apex Idea Marketplace
        </span>
      </div>
      
      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-apex-green rounded-full flex items-center justify-center mb-6 shadow-xl shadow-apex-green/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-serif text-deep-ink mb-2">Spark Ignited!</h2>
            <p className="text-muted-slate mb-8">Redirecting you to the feed...</p>
        </div>
      ) : (
        <PromptHeader onIdeaSubmit={handleIdeaSubmit} />
      )}
      
      {!isSubmitted && (
        <div className="mt-12 flex gap-8 items-center text-muted-slate animate-fade-in delay-200">
            <Link href="/sparks" className="group flex items-center gap-2 hover:text-deep-ink transition-colors">
            <span>Explore existing sparks</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>
      )}
    </main>
  );
}
