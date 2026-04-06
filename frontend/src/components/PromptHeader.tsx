"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PromptHeader({ onIdeaSubmit }: { onIdeaSubmit: (text: string, description?: string) => void }) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const { token } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && token) {
      onIdeaSubmit(text, description.trim());
      setText("");
      setDescription("");
    }
  };

  const hasContent = text.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto my-12 md:my-20 text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-deep-ink mb-8 tracking-tight">What if we&hellip;</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-0 items-center relative bg-white rounded-[24px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-line-gray/20 overflow-hidden transition-all duration-500 ease-in-out">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          autoFocus
          placeholder="simplify the permit application process for new businesses?"
          className="w-full text-xl md:text-2xl p-8 border-none focus:outline-none placeholder:text-muted-slate/40 text-deep-ink bg-transparent"
        />

        {/* Smoothly Expanding Section */}
        <div 
            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${hasContent ? "max-h-[500px] opacity-100 border-t border-line-gray/10" : "max-h-0 opacity-0"}`}
        >
            <div className="p-8 pt-6 space-y-6 text-left">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-slate tracking-widest px-1">Additional Details (Optional)</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us a bit more about how this would work or why it matters..."
                        className="w-full p-4 rounded-xl bg-soft-canvas/50 border border-line-gray/20 focus:outline-none focus:ring-2 focus:ring-apex-green transition-all text-sm text-deep-ink min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex flex-row justify-between items-center gap-6">
                    <div className="opacity-40 text-[10px] font-bold text-muted-slate flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-apex-green rounded-full"></div>
                        CONNECTED AS APEX STAFF
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-mono text-muted-slate/50">{text.length}/300</span>
                        <button 
                            type="submit"
                            className="px-10 py-3.5 bg-apex-green text-white rounded-xl font-bold hover:bg-[#286051] hover:-translate-y-0.5 hover:shadow-xl shadow-apex-green/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            disabled={!text.trim()}
                        >
                            Spark It
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
