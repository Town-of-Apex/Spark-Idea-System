"use client";
import { useState, useEffect } from "react";
import IdeaCard, { IdeaType } from "@/components/IdeaCard";

const API_URL = "http://localhost:8000";

export default function SparksPage() {
  const [ideas, setIdeas] = useState<IdeaType[]>([]);
  const [sortBy, setSortBy] = useState<"new" | "trending">("trending");

  const fetchIdeas = async (sort: string) => {
    try {
      const res = await fetch(`${API_URL}/ideas/?sort_by=${sort}`);
      const data = await res.json();
      setIdeas(data);
    } catch (e) {
      console.error("Failed to fetch ideas", e);
    }
  };

  useEffect(() => {
    fetchIdeas(sortBy);
  }, [sortBy]);

  const handleVote = async (id: number) => {
    const mockUsername = "User" + Math.floor(Math.random() * 10000);
    try {
      await fetch(`${API_URL}/ideas/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: mockUsername }),
      });
    } catch (e) {
      console.error("Failed to vote", e);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-8 py-12 w-full pb-32">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-deep-ink mb-4">Community Sparks</h1>
        <p className="text-lg text-muted-slate max-w-2xl">
          The collective brilliance of the Town of Apex. Upvote the ideas you want to see come to life.
        </p>
      </header>

      <div className="flex justify-between items-center mb-10 sticky top-0 py-4 bg-soft-canvas/80 backdrop-blur-md z-10 border-b border-line-gray/50">
        <div className="flex gap-2 p-1 bg-white/40 rounded-full border border-line-gray/30 shadow-sm">
          <button 
            onClick={() => setSortBy("trending")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              sortBy === "trending" 
                ? "bg-white text-deep-ink shadow-md" 
                : "text-muted-slate hover:text-deep-ink"
            }`}
          >
            🔥 Trending
          </button>
          <button 
            onClick={() => setSortBy("new")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              sortBy === "new" 
                ? "bg-white text-deep-ink shadow-md" 
                : "text-muted-slate hover:text-deep-ink"
            }`}
          >
            ✨ Newest
          </button>
        </div>
        
        <div className="text-sm font-medium text-muted-slate">
          Showing <span className="text-deep-ink">{ideas.length}</span> ideas
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ideas.length === 0 ? (
          <div className="text-center text-muted-slate py-24 bg-white/30 rounded-[24px] border border-dashed border-line-gray/50">
            <div className="text-4xl mb-4">🌪️</div>
            <p className="text-xl font-medium">It's quiet in here...</p>
            <p className="text-sm mt-2 opacity-70 italic">Be the one to spark the next big thing.</p>
          </div>
        ) : (
          ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onVote={handleVote} onUpdate={() => fetchIdeas(sortBy)} />
          ))
        )}
      </div>
    </main>
  );
}
