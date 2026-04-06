"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PromptHeader from "@/components/PromptHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleIdeaSubmit = async (text: string, description?: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/ideas/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text, description }),
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
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-4xl mx-auto py-20">
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
        <>
            <PromptHeader onIdeaSubmit={handleIdeaSubmit} />
            
            {/* What is a Spark Section */}
            <div className="w-full max-w-2xl mt-12 animate-fade-in delay-500">
                <details className="group bg-white/50 rounded-2xl border border-line-gray/20 hover:border-apex-green/20 transition-all">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                        <span className="text-sm font-bold text-muted-slate group-hover:text-apex-green transition-colors flex items-center gap-2">
                            <span className="text-lg">💡</span> What exactly is a Spark?
                        </span>
                        <span className="text-muted-slate group-open:rotate-180 transition-transform">↓</span>
                    </summary>
                    <div className="px-6 pb-8 space-y-6 text-sm text-muted-slate leading-relaxed border-t border-line-gray/10 pt-6">
                        <p>
                            A <strong className="text-deep-ink">Spark</strong> is a tiny seed for a big change. It's not a fully-fledged project proposal yet—it's that "What if we..." moment that hits you during your morning coffee or while walking down Salem Street.
                        </p>
                        
                        <div>
                            <p className="font-bold text-deep-ink mb-3 uppercase tracking-widest text-[10px]">Examples of Great Sparks:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>"What if we added solar benches to the Town Hall courtyard?"</li>
                                <li>"What if we digitized the temporary sign permit process?"</li>
                                <li>"What if we created a 'Welcome to Apex' kit for new business owners?"</li>
                            </ul>
                        </div>

                        <div className="bg-soft-canvas/50 p-4 rounded-xl border border-line-gray/20">
                            <p className="font-bold text-deep-ink mb-2 uppercase tracking-widest text-[10px]">The Upvote System:</p>
                            <p>Each staff member can upvote a Spark once. Upvotes help us understand collective interest and priority. You can always change your mind by clicking the vote button again.</p>
                        </div>

                        <div className="pt-4 opacity-70 text-[11px] italic">
                            <p><strong>Disclaimer:</strong> Sharing an idea doesn't guarantee implementation. Everything shared here is reviewed and considered seriously by the leadership team, but constraints like budget, policy, and staffing apply. We're here to listen, explore, and ignite change together.</p>
                        </div>
                    </div>
                </details>
            </div>
        </>
      )}
      
      {!isSubmitted && (
        <div className="mt-12 flex gap-8 items-center text-muted-slate animate-fade-in delay-700">
            <Link href="/sparks" className="group flex items-center gap-2 hover:text-deep-ink transition-colors text-sm font-medium">
                <span>Explore existing sparks</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>
      )}
    </main>
  );
}
