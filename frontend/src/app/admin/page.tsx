"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API_URL = "http://localhost:8000";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Stats {
  total_ideas: number;
  total_votes: number;
  ideas_by_department: Record<string, number>;
}

export default function AdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [threshold, setThreshold] = useState(0.8);
  const [newIdeaTTL, setNewIdeaTTL] = useState(2);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#5C6B73");
  const { token } = useAuth();

  const [aiFields, setAiFields] = useState<any[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldDesc, setNewFieldDesc] = useState("");
  const [newFieldType, setNewFieldType] = useState("numeric");

  useEffect(() => {
    if (token) {
        fetchTags();
        fetchStats();
        fetchSettings();
        fetchAiFields();
    }
  }, [token]);

  const fetchTags = async () => {
    const res = await fetch(`${API_URL}/tags/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    setTags(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    setStats(await res.json());
  };

  const fetchSettings = async () => {
    const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setThreshold(data.similarity_threshold);
    setNewIdeaTTL(data.new_idea_ttl);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !token) return;
    await fetch(`${API_URL}/tags/`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name: newTagName, color: newTagColor }),
    });
    setNewTagName("");
    fetchTags();
  };

  const handleDeleteTag = async (id: number) => {
    if (!token) return;
    await fetch(`${API_URL}/tags/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchTags();
  };

  const fetchAiFields = async () => {
    const res = await fetch(`${API_URL}/admin/ai-fields`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    setAiFields(await res.json());
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim() || !token) return;
    await fetch(`${API_URL}/admin/ai-fields`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ 
        label: newFieldLabel, 
        description: newFieldDesc, 
        field_type: newFieldType 
      }),
    });
    setNewFieldLabel("");
    setNewFieldDesc("");
    fetchAiFields();
  };

  const handleDeleteField = async (id: number) => {
    if (!token) return;
    await fetch(`${API_URL}/admin/ai-fields/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchAiFields();
  };

  const handleUpdateSettings = async (updates: any) => {
    if (!token) return;
    const newSettings = {
        similarity_threshold: updates.threshold ?? threshold,
        new_idea_ttl: updates.ttl ?? newIdeaTTL
    };
    
    if (updates.threshold !== undefined) setThreshold(updates.threshold);
    if (updates.ttl !== undefined) setNewIdeaTTL(updates.ttl);

    await fetch(`${API_URL}/admin/settings`, {
      method: "PATCH",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newSettings),
    });
  };

  return (
    <main className="max-w-6xl mx-auto px-8 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-serif text-deep-ink mb-2">System Settings</h1>
        <p className="text-muted-slate font-medium uppercase tracking-widest text-xs">Administrative Control Center</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[24px] border border-line-gray/30 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted-slate mb-1">Total Sparks</p>
                <p className="text-4xl font-serif text-deep-ink">{stats?.total_ideas || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-line-gray/30 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-muted-slate mb-1">Interactions</p>
                <p className="text-4xl font-serif text-deep-ink font-bold text-apex-green">{stats?.total_votes || 0}</p>
            </div>
          </section>

          {/* AI Metadata Fields */}
          <section className="bg-white p-8 rounded-[32px] border border-line-gray/40 shadow-sm">
            <h2 className="text-xl font-bold text-deep-ink mb-2">AI Insights Lab</h2>
            <p className="text-sm text-muted-slate mb-6">Define custom dimensions for AI to analyze in every new Spark.</p>
            
            <form onSubmit={handleAddField} className="space-y-4 mb-10 bg-soft-canvas/50 p-6 rounded-2xl border border-line-gray/20">
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        placeholder="Field Label (e.g. Utility)"
                        className="px-4 py-2 rounded-xl bg-white border border-line-gray/30 text-sm"
                    />
                    <select 
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white border border-line-gray/30 text-sm"
                    >
                        <option value="numeric">Numeric (0-10)</option>
                        <option value="categorical">Categorical</option>
                    </select>
                </div>
                <input 
                    type="text" 
                    value={newFieldDesc}
                    onChange={(e) => setNewFieldDesc(e.target.value)}
                    placeholder="Description to guide the AI..."
                    className="w-full px-4 py-2 rounded-xl bg-white border border-line-gray/30 text-sm"
                />
                <button type="submit" className="w-full py-2.5 bg-apex-green text-white rounded-xl text-sm font-bold shadow-lg shadow-apex-green/20">
                    Add Analyzing Dimension
                </button>
            </form>

            <div className="space-y-3">
                {aiFields.map(field => (
                    <div key={field.id} className="flex items-center justify-between p-4 rounded-xl border border-line-gray/30 hover:border-apex-green/30 hover:bg-apex-green/[0.02] transition-all group">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-deep-ink">{field.label}</span>
                                <span className="px-2 py-0.5 rounded-md bg-soft-canvas text-[9px] uppercase font-bold text-muted-slate">{field.field_type}</span>
                            </div>
                            <p className="text-xs text-muted-slate line-clamp-1">{field.description}</p>
                        </div>
                        <button onClick={() => handleDeleteField(field.id)} className="p-2 text-muted-slate hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* Tag Management */}
          <section className="bg-white p-8 rounded-[32px] border border-line-gray/40 shadow-sm">
            <h2 className="text-xl font-bold text-deep-ink mb-6">Categorization Tags</h2>
            
            <form onSubmit={handleAddTag} className="flex gap-3 mb-8">
                <input 
                    type="text" 
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New Tag Name (e.g. High ROI)"
                    className="flex-1 px-4 py-2 rounded-full bg-soft-canvas border-none focus:ring-2 focus:ring-apex-green text-sm"
                />
                <input 
                    type="color" 
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-10 p-1 bg-soft-canvas rounded-full border-none cursor-pointer"
                />
                <button type="submit" className="px-6 py-2 bg-deep-ink text-white rounded-full text-sm font-bold hover:bg-black transition-colors">Add</button>
            </form>

            <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-4 py-2 rounded-full border border-line-gray/50 bg-soft-canvas group hover:border-deep-ink transition-all">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                        <span className="text-sm font-bold text-deep-ink">{tag.name}</span>
                        <button onClick={() => handleDeleteTag(tag.id)} className="ml-2 text-muted-slate hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* AI Settings */}
          <section className="bg-white p-8 rounded-[32px] border border-line-gray/40 shadow-sm">
            <h2 className="text-xl font-bold text-deep-ink mb-2">AI Similarity Engine</h2>
            <p className="text-sm text-muted-slate mb-8">Adjust how strictly the system clusters related ideas.</p>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-xs uppercase font-bold text-muted-slate tracking-widest">Similarity Threshold</label>
                        <span className="text-2xl font-serif text-apex-green">{(threshold * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={threshold}
                        onChange={(e) => handleUpdateSettings({ threshold: parseFloat(e.target.value) })}
                        className="w-full accent-apex-green"
                    />
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-slate opacity-40 mt-2">
                        <span>Broad Clusters</span>
                        <span>Exact Matches</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-line-gray/20">
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-xs uppercase font-bold text-muted-slate tracking-widest">"New" Spark TTL</label>
                        <span className="text-2xl font-serif text-deep-ink">{newIdeaTTL} Days</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="14" 
                        step="1"
                        value={newIdeaTTL}
                        onChange={(e) => handleUpdateSettings({ ttl: parseInt(e.target.value) })}
                        className="w-full accent-deep-ink"
                    />
                    <p className="text-[10px] text-muted-slate mt-2 italic">Controls how long a spark displays the "New" badge.</p>
                </div>
            </div>
          </section>
        </div>

        {/* Breakdown Column */}
        <div className="space-y-8">
            <section className="bg-deep-ink text-white p-8 rounded-[32px] shadow-xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="text-xl">🏷️</span> Tag Overview
                </h2>
                <div className="space-y-4">
                    {tags.map(tag => {
                        const count = tags.find(t => t.id === tag.id)?.id; // This is a placeholder, I should calculate real counts
                        // Actually, I can just use the tags state and map them.
                        return (
                            <div key={tag.id} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/5 hover:bg-white/20 transition-colors">
                                <span className="text-sm font-medium opacity-80">{tag.name}</span>
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></span>
                            </div>
                        );
                    })}
                    {tags.length === 0 && (
                        <p className="text-xs opacity-40 italic">No tags defined.</p>
                    )}
                </div>
            </section>

            <section className="bg-white border border-line-gray/30 p-8 rounded-[32px] shadow-sm">
                <h2 className="text-lg font-bold text-deep-ink mb-6 flex items-center gap-2">
                    <span className="text-xl">🏛️</span> Department Activity
                </h2>
                <div className="space-y-4">
                    {Object.entries(stats?.ideas_by_department || {}).map(([dept, count]) => (
                        <div key={dept} className="flex justify-between items-center group">
                            <span className="text-sm font-medium text-muted-slate group-hover:text-deep-ink transition-colors">{dept}</span>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 bg-apex-green/20 rounded-full w-24 overflow-hidden">
                                    <div 
                                        className="h-full bg-apex-green rounded-full transition-all duration-1000" 
                                        style={{ width: `${(count / (stats?.total_ideas || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-deep-ink w-4">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

      </div>
    </main>
  );
}
