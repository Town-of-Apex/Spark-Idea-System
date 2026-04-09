"use client";
import { useState, useEffect } from "react";
import IdeaCard, { IdeaType } from "@/components/IdeaCard";
import { useAuth } from "@/context/AuthContext";
import PageTemplate from "@/components/PageTemplate";

const API_URL = "http://localhost:8000";

export default function SparksPage() {
  const [ideas, setIdeas] = useState<IdeaType[]>([]);
  const [sortBy, setSortBy] = useState<"new" | "trending">("trending");
  const { token } = useAuth();

  const fetchIdeas = async (sort: string) => {
    try {
      const res = await fetch(`${API_URL}/ideas/?sort_by=${sort}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setIdeas(data);
    } catch (e) {
      console.error("Failed to fetch ideas", e);
    }
  };

  useEffect(() => {
    fetchIdeas(sortBy);
  }, [sortBy, token]);

  return (
    <PageTemplate
      title="Sparks"
      subtitle="The collective creativity of the Town of Apex. Upvote the ideas you want to see come to life."
      headerContent={
        <div className="flex gap-2 p-1 bg-white/40 rounded-md border border-line/30 shadow-sm self-end">
          <button 
            onClick={() => setSortBy("trending")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              sortBy === "trending" 
                ? "bg-teal text-white shadow-md" 
                : "text-rosy hover:text-teal"
            }`}
          >
            Trending
          </button>
          <button 
            onClick={() => setSortBy("new")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              sortBy === "new" 
                ? "bg-teal text-white shadow-md" 
                : "text-rosy hover:text-teal"
            }`}
          >
            Newest
          </button>
        </div>
      }
    >
      <div className="flex justify-end mb-6">
        <div className="text-sm font-medium text-rosy py-2 border-b border-line/30">
          Showing <span className="text-stone-800 font-bold">{ideas.length}</span> active sparks
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ideas.length === 0 ? (
          <div className="text-center text-rosy py-24 bg-white/30 rounded-xl border border-dashed border-line/50">
            <p className="text-xl font-medium">It's quiet in here...</p>
            <p className="text-sm mt-2 opacity-70 italic">Be the one to spark the next big thing.</p>
          </div>
        ) : (
          ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onUpdate={() => fetchIdeas(sortBy)} />
          ))
        )}
      </div>
    </PageTemplate>
  );
}
