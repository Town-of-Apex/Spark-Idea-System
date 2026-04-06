"use client";
import { useState, useEffect } from "react";
import StatusTag from "./StatusTag";
import { IdeaType } from "./IdeaCard";

const API_URL = "http://localhost:8000";

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function IdeaModal({ 
  ideaId, 
  onClose, 
  onUpdate 
}: { 
  ideaId: number; 
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [idea, setIdea] = useState<IdeaType | null>(null);
  const [similarIdeas, setSimilarIdeas] = useState<IdeaType[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIdea();
    fetchSimilar();
    fetchTags();
  }, [ideaId]);

  const fetchIdea = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas/${ideaId}`);
      const data = await res.json();
      setIdea(data);
      setEditedDescription(data.description || "");
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimilar = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas/${ideaId}/similar`);
      const data = await res.json();
      setSimilarIdeas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_URL}/tags/`);
      const data = await res.json();
      setAllTags(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    try {
      await fetch(`${API_URL}/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editedDescription }),
      });
      setIsEditing(false);
      fetchIdea();
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTag = async (tagId: number) => {
    if (!idea) return;
    const currentTagIds = idea.tags.map(t => t.id);
    const newTagIds = currentTagIds.includes(tagId) 
        ? currentTagIds.filter(id => id !== tagId)
        : [...currentTagIds, tagId];
    
    try {
        await fetch(`${API_URL}/ideas/${ideaId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag_ids: newTagIds }),
        });
        fetchIdea();
        onUpdate();
    } catch (e) {
        console.error(e);
    }
  };

  if (isLoading || !idea) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-deep-ink/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[24px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-line-gray flex justify-between items-start bg-soft-canvas/30">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
                <StatusTag status={idea.status} />
                <span className="text-xs font-mono text-muted-slate uppercase tracking-widest">#{idea.id}</span>
            </div>
            <h2 className="text-3xl font-serif text-deep-ink leading-tight">{idea.text}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
                {idea.tags.map(tag => (
                    <span 
                      key={tag.id} 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: tag.color }}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-line-gray rounded-full transition-colors text-muted-slate hover:text-deep-ink">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-muted-slate">Implementation Details</h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-xs text-apex-green font-bold hover:underline">Edit</button>
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea 
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Add more context, challenges, or steps for this idea..."
                            className="w-full h-40 p-4 rounded-[12px] bg-soft-canvas border border-line-gray focus:outline-none focus:ring-2 focus:ring-apex-green text-deep-ink"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleUpdate} className="px-4 py-2 bg-apex-green text-white rounded-full text-sm font-bold">Save Changes</button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-muted-slate hover:text-deep-ink text-sm font-bold">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-deep-ink whitespace-pre-wrap leading-relaxed">
                        {idea.description || "No detailed description added yet. Add context to help others understand the impact of this spark."}
                    </p>
                )}
            </section>

            <section>
                <h3 className="text-xs uppercase tracking-widest font-bold text-muted-slate mb-4">Similar Sparks (AI Powered)</h3>
                <div className="space-y-3">
                    {similarIdeas.length === 0 ? (
                        <p className="text-sm text-muted-slate italic">No closely related ideas found yet.</p>
                    ) : (
                        similarIdeas.map(sim => (
                            <div key={sim.id} className="p-3 rounded-[12px] border border-line-gray/50 hover:bg-soft-canvas transition-colors cursor-pointer flex justify-between items-center group">
                                <span className="text-sm font-medium text-deep-ink truncate mr-4">{sim.text}</span>
                                <span className="text-[10px] font-bold text-warm-signal uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Related</span>
                            </div>
                        ))
                    )}
                </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <section>
                <h3 className="text-xs uppercase tracking-widest font-bold text-muted-slate mb-4">Metadata</h3>
                <div className="bg-soft-canvas rounded-[16px] p-5 space-y-4">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-slate opacity-60">Submitted By</p>
                        <p className="text-sm font-bold text-deep-ink">{idea.username}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-slate opacity-60">Department</p>
                        <p className="text-sm font-bold text-deep-ink">{idea.department || "Unspecified"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-slate opacity-60">Submitted At</p>
                        <p className="text-sm font-bold text-deep-ink">{new Date(idea.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-slate opacity-60">Total Upvotes</p>
                        <p className="text-sm font-bold text-apex-green">{idea.vote_count}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-line-gray/20">
                        <p className="text-[10px] uppercase font-bold text-muted-slate opacity-60 mb-2">Strategic Positioning</p>
                        {idea.ai_metadata?.["Implementation Difficulty"] && idea.ai_metadata?.["Public Impact"] ? (
                            <div className="space-y-3">
                                <div className="relative w-full aspect-square bg-white border border-line-gray/30 rounded-xl overflow-visible p-4">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-line-gray/10"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-line-gray/10"></div>
                                    <div className="absolute top-1 left-1 text-[7px] font-bold text-muted-slate/20 uppercase">Big Bets</div>
                                    <div className="absolute bottom-1 right-1 text-[7px] font-bold text-muted-slate/20 uppercase">Fill-ins</div>
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                                        <circle 
                                            cx={parseFloat(idea.ai_metadata["Implementation Difficulty"]) * 10} 
                                            cy={100 - (parseFloat(idea.ai_metadata["Public Impact"]) * 10)} 
                                            r="5" 
                                            fill="#2F6F5E" 
                                            className="animate-pulse"
                                        />
                                    </svg>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-white p-2 rounded-lg border border-line-gray/10">
                                        <p className="text-[8px] uppercase font-bold text-muted-slate">Effort</p>
                                        <p className="text-xs font-bold text-deep-ink">{idea.ai_metadata["Implementation Difficulty"]}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-line-gray/10">
                                        <p className="text-[8px] uppercase font-bold text-muted-slate">Impact</p>
                                        <p className="text-xs font-bold text-apex-green">{idea.ai_metadata["Public Impact"]}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center bg-white/50 rounded-xl border border-dashed border-line-gray/40">
                                <p className="text-[9px] text-muted-slate font-bold animate-pulse">🤖 AI ANALYZING...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xs uppercase tracking-widest font-bold text-muted-slate mb-4">Manage Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                        const isSelected = idea.tags.some(t => t.id === tag.id);
                        return (
                            <button 
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    isSelected 
                                    ? "bg-deep-ink border-deep-ink text-white" 
                                    : "bg-white border-line-gray text-muted-slate hover:border-deep-ink"
                                }`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
