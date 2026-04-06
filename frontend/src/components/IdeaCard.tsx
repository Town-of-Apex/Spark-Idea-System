"use client";
import { useState, useEffect } from "react";
import StatusTag from "./StatusTag";
import IdeaModal from "./IdeaModal";

export interface IdeaType {
  id: number;
  text: string;
  description: string | null;
  username: string;
  department: string | null;
  status: string;
  vote_count: number;
  created_at: string;
  tags: { id: number; name: string; color: string }[];
  ai_metadata: Record<string, string>;
}

const API_URL = "http://localhost:8000";

export default function IdeaCard({ 
    idea, 
    onVote, 
    onUpdate 
}: { 
    idea: IdeaType; 
    onVote: (id: number) => void;
    onUpdate: () => void;
}) {
  const [hasVoted, setHasVoted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [similarCount, setSimilarCount] = useState(0);

  useEffect(() => {
    fetchSimilarCount();
  }, [idea.id]);

  const fetchSimilarCount = async () => {
    try {
        const res = await fetch(`${API_URL}/ideas/${idea.id}/similar`);
        const data = await res.json();
        setSimilarCount(data.length);
    } catch (e) {
        console.error(e);
    }
  };

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening modal
    if (!hasVoted) {
      setHasVoted(true);
      onVote(idea.id);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group relative bg-white p-6 rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_45px_-10px_rgba(47,111,94,0.12)] hover:-translate-y-[4px] transition-all duration-500 ease-out border border-line-gray/30 hover:border-apex-green/20 cursor-pointer flex gap-6"
      >
        
        {/* Vote Column */}
        <div className="flex flex-col items-center justify-start pt-1">
          <button 
            onClick={handleVote}
            className={`flex flex-col items-center justify-center p-3 rounded-[16px] min-w-[3.5rem] transition-all duration-300 ${hasVoted ? "bg-warm-signal/15 text-warm-signal ring-2 ring-warm-signal/20" : "bg-soft-canvas text-muted-slate hover:bg-line-gray hover:text-deep-ink"}`}
          >
            <svg className={`w-8 h-8 transition-transform duration-500 ${hasVoted ? "fill-warm-signal scale-110 rotate-12" : "fill-transparent stroke-current stroke-[2.5]"}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12h5v8h6v-8h5L12 4z" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-base mt-2 tracking-tighter">{idea.vote_count + (hasVoted ? 1 : 0)}</span>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2 items-center">
                <StatusTag status={idea.status} />
                {idea.tags.slice(0, 2).map(tag => (
                   <span key={tag.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} title={tag.name}></span>
                ))}
              </div>
              <span className="text-[11px] font-bold text-muted-slate/60 uppercase tracking-widest bg-soft-canvas px-2 py-1 rounded-md">
                {idea.department || "Town Staff"}
              </span>
            </div>
            <h3 className="text-xl md:text-[23px] font-medium text-deep-ink leading-[1.3] tracking-tight group-hover:text-apex-green transition-colors">
              {idea.text}
            </h3>
          </div>

          <div className="mt-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-slate pt-4 border-t border-line-gray/30">
            <span>by {idea.username}</span>
            <div className="flex gap-4">
                {similarCount > 0 && (
                    <span className="text-warm-signal flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-warm-signal rounded-full"></span>
                        {similarCount} similar sparks
                    </span>
                )}
                <span className="opacity-40">{new Date(idea.created_at).toLocaleDateString()}</span>
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
