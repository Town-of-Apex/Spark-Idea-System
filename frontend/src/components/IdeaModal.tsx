"use client";
import { useState, useEffect } from "react";
import StatusTag from "./StatusTag";
import { IdeaType } from "./IdeaCard";
import { useAuth } from "@/context/AuthContext";

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
  onClose: () => void; // Close handler
  onUpdate: () => void; // Update handler
}) {
  const [idea, setIdea] = useState<IdeaType | null>(null);
  const [similarIdeas, setSimilarIdeas] = useState<IdeaType[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchIdea();
    fetchSimilar();
    fetchTags();
  }, [ideaId]);

  const fetchIdea = async () => {
    try {
      const res = await fetch(`${API_URL}/ideas/${ideaId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
      const res = await fetch(`${API_URL}/ideas/${ideaId}/similar`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setSimilarIdeas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_URL}/tags/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setAllTags(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
    if (!idea || !token) return;
    const currentTagIds = idea.tags.map(t => t.id);
    const newTagIds = currentTagIds.includes(tagId) 
        ? currentTagIds.filter(id => id !== tagId)
        : [...currentTagIds, tagId];
    
    try {
        await fetch(`${API_URL}/ideas/${ideaId}`, {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
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
      <div className="absolute inset-0 bg-stone-800/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content - L1 Surface */}
      <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-line animate-in zoom-in-95 duration-300"
      >
        
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-line flex justify-between items-start bg-canvas/30">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        {idea.is_new && <StatusTag status="New" />}
                        <span className="text-xs font-mono text-rosy uppercase tracking-widest">#{idea.id}</span>
                    </div>
                    <h2 className="text-3xl font-serif text-teal leading-tight">{idea.text}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {idea.tags.map(tag => (
                            <span 
                                key={tag.id} 
                                className="px-3 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-inner rounded-md transition-colors text-rosy hover:text-stone-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Body - Main Info */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-rosy py-1 border-b-2 border-teal/20">Implementation Analysis</h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-inner hover:bg-teal/10 text-[10px] text-teal font-bold uppercase tracking-widest rounded-md transition-all">Edit Details</button>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea 
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Add more context, challenges, or steps for this idea..."
                                className="w-full h-48 p-4 rounded-lg bg-inner border border-line focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal text-stone-800 leading-relaxed shadow-inner"
                            />
                            <div className="flex gap-3">
                                <button onClick={handleUpdate} className="px-6 py-2 bg-teal text-white rounded-md text-sm font-bold hover:bg-teal/90 transition-all shadow-md shadow-teal/20">Save Updates</button>
                                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-rosy hover:text-teal text-sm font-bold">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-inner/30 p-6 rounded-xl border border-line/40">
                            <p className="text-stone-800 whitespace-pre-wrap leading-relaxed">
                                {idea.description || "No detailed description added yet. Add context to help others understand the impact of this spark."}
                            </p>
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-rosy mb-6 py-1 border-b-2 border-teal/20 w-fit">Semantic Neighbors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {similarIdeas.length === 0 ? (
                            <p className="text-sm text-rosy italic col-span-2">No closely related ideas found yet.</p>
                        ) : (
                            similarIdeas.map(sim => (
                                <div key={sim.id} className="p-4 rounded-xl border border-line bg-surface hover:border-teal hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2">
                                    <span className="text-sm font-medium text-stone-800 leading-snug">{sim.text}</span>
                                    <span className="text-[9px] font-bold text-teal opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">View Connection →</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>

        {/* Sidebar - L2 Inner */}
        <div className="w-full md:w-80 bg-inner p-8 border-l border-line flex flex-col gap-8 overflow-y-auto overflow-x-hidden">
            <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-rosy mb-6">Metadata</h3>
                <div className="bg-surface rounded-xl p-5 space-y-5 border border-line shadow-sm">
                    <div>
                        <p className="text-[9px] uppercase font-bold text-rosy mb-1">Submitted By</p>
                        <p className="text-sm font-bold text-teal">{idea.username}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-rosy mb-1">Department</p>
                        <p className="text-sm font-bold text-stone-800">{idea.department || "Unspecified"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-rosy mb-1">Submitted At</p>
                        <p className="text-sm font-bold text-stone-800">{new Date(idea.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-line">
                        <p className="text-[9px] uppercase font-bold text-rosy mb-3">Priority Score</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-inner rounded-md overflow-hidden border border-line/30">
                                <div className="h-full bg-teal" style={{ width: `${Math.min(100, (idea.vote_count / 10) * 100)}%` }}></div>
                            </div>
                            <span className="text-sm font-black text-teal">{idea.vote_count}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex-1">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-rosy mb-6">Categorization</h3>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                        const isSelected = idea.tags.some(t => t.id === tag.id);
                        return (
                            <button 
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${
                                    isSelected 
                                    ? "bg-stone-800 border-stone-800 text-white shadow-md shadow-stone-800/20" 
                                    : "bg-surface border-line text-rosy hover:border-teal hover:text-teal"
                                }`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {idea.ai_metadata?.["Public Impact"] && (
                <section className="mt-auto pt-6 border-t border-line/50">
                    <div className="bg-teal p-5 rounded-xl shadow-lg shadow-teal/30">
                        <p className="text-[9px] font-bold text-white/60 mb-3 uppercase tracking-[0.1em]">AI Strategic Vector</p>
                        <div className="flex justify-between items-end border-b border-white/20 pb-3 mb-3">
                            <span className="text-2xl font-serif text-white">{idea.ai_metadata["Public Impact"]}</span>
                            <span className="text-[9px] font-bold text-white uppercase opacity-80 mb-1">Impact Score</span>
                        </div>
                        <p className="text-[10px] text-white/80 leading-relaxed italic line-clamp-2">"High confidence mapping relative to Town priorities."</p>
                    </div>
                </section>
            )}
        </div>
      </div>
    </div>
  );
}
