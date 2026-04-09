"use client";
import { useState, useEffect } from "react";
import StatusTag from "./StatusTag";
import IdeaModal from "./IdeaModal";
import { useAuth } from "@/context/AuthContext";

export interface IdeaType {
  id: number;
  text: string;
  description: string | null;
  username: string;
  department: string | null;
  status: string;
  is_new: boolean;
  has_voted: boolean;
  vote_count: number;
  has_embedding: boolean;
  created_at: string;
  tags: { id: number; name: string; color: string }[];
  ai_metadata?: Record<string, string>;
  user?: { id: number; email: string; display_name: string | null; role: string };
}

const API_URL = "http://localhost:8000";

export default function IdeaCard({ 
    idea, 
    onVote, 
    onUpdate 
}: { 
    idea: IdeaType; 
    onVote?: (id: number) => void;
    onUpdate: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [similarCount, setSimilarCount] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    fetchSimilarCount();
  }, [idea.id]);

  const fetchSimilarCount = async () => {
    try {
        const res = await fetch(`${API_URL}/ideas/${idea.id}/similar`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setSimilarCount(Array.isArray(data) ? data.length : 0);
    } catch (e) {
        console.error(e);
    }
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/ideas/${idea.id}/vote`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (res.ok) {
            onUpdate();
        }
    } catch (err) {
        console.error("Vote failed", err);
    }
  };

  const handleProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
        await fetch(`${API_URL}/ideas/${idea.id}/process`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        onUpdate();
    } catch (err) {
        console.error("AI Process trigger failed", err);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group relative bg-surface p-6 rounded-xl hover:shadow-md hover:shadow-teal/10 hover:-translate-y-0.5 transition-all duration-500 ease-out border border-line hover:border-teal/30 cursor-pointer flex gap-6 animate-in fade-in slide-in-from-bottom-4"
      >
        
        {/* Vote Column */}
        <div className="flex flex-col items-center justify-start pt-1">
          <button 
            onClick={handleVote}
            className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[3.5rem] transition-all duration-300 ${idea.has_voted ? "bg-teal text-white shadow-md" : "bg-canvas text-rosy hover:bg-line hover:text-teal"}`}
          >
            <svg className={`w-8 h-8 transition-transform duration-500 ${idea.has_voted ? "fill-white scale-110" : "fill-transparent stroke-current stroke-[2.5]"}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12h5v8h6v-8h5L12 4z" strokeLinejoin="round" />
            </svg>
            <span className={`font-bold text-base mt-2 tracking-tighter ${idea.has_voted ? "text-white" : ""}`}>{idea.vote_count}</span>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
              <div className="flex flex-wrap gap-2 items-center min-w-0">
                {idea.is_new && <StatusTag status="New" />}
                {idea.tags.slice(0, 3).map(tag => (
                   <span key={tag.id} className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ backgroundColor: tag.color }}>
                     {tag.name}
                   </span>
                ))}
              </div>
              <div className="flex flex-col items-end gap-1.5 text-right flex-shrink-0">
                <span className="text-[11px] font-bold text-rosy uppercase tracking-widest bg-canvas px-2 py-1 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {idea.department || "Town Staff"}
                </span>
                {/* Admin Only: Embedding Status & Action */}
                {token && useAuth().user?.role === "admin" && (
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                        <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${idea.has_embedding ? "text-teal border-teal/30 bg-teal/5" : "text-gold border-gold/30 bg-gold/5 animate-pulse"}`}>
                            {idea.has_embedding ? "AI READY" : "AI PENDING"}
                        </span>
                        <button 
                            onClick={handleProcess}
                            className="text-[8px] font-black underline hover:text-teal transition-colors opacity-50 hover:opacity-100"
                            title="Manually trigger AI Embedding/Analysis"
                        >
                            REPROCESS
                        </button>
                    </div>
                )}
              </div>
            </div>
            <h3 className="text-xl md:text-[23px] font-medium text-teal leading-[1.3] tracking-tight group-hover:opacity-80 transition-opacity line-clamp-2 break-words">
              {idea.text}
            </h3>
          </div>

          <div className="mt-6 flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-rosy pt-4 border-t border-line/30 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <div className="w-5 h-5 bg-line rounded-md flex items-center justify-center text-[8px] flex-shrink-0">
                    {(idea.user?.display_name || idea.username || "A")[0].toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{idea.user?.display_name || idea.username}</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center flex-shrink-0">
                {similarCount > 0 && (
                    <span className="text-gold flex items-center gap-1.5 animate-pulse whitespace-nowrap">
                        <span className="w-1.5 h-1.5 bg-gold rounded-sm"></span>
                        {similarCount} similar sparks
                    </span>
                )}
                <span className="opacity-40 whitespace-nowrap">{new Date(idea.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <IdeaModal 
            ideaId={idea.id} 
            onClose={() => setShowModal(false)}
            onUpdate={onUpdate}
        />
      )}
    </>
  );
}
