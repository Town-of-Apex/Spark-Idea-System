"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Tooltip from "@/components/Tooltip";

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
    <div className="w-full max-w-3xl my-12 md:my-20 text-left">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-teal mb-8 tracking-tight">What if we&hellip;</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-0 items-stretch relative bg-surface rounded-xl border border-line overflow-hidden transition-all duration-500 ease-in-out shadow-sm">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          autoFocus
          placeholder="simplify the permit application process for new businesses?"
          className="w-full text-xl md:text-2xl p-6 border-none focus:outline-none placeholder:rosy/40 text-stone-800 bg-transparent"
        />

        {/* Smoothly Expanding Section */}
        <div 
            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${hasContent ? "max-h-[500px] opacity-100 border-t border-line/10" : "max-h-0 opacity-0"}`}
        >
            <div className="p-8 pt-6 space-y-6 text-left">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-rosy tracking-widest px-1">Additional Details (Optional)</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us a bit more about how this would work or why it matters..."
                        className="w-full p-4 rounded-lg bg-inner border border-line focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all text-sm text-stone-800 min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex flex-row justify-between items-center gap-6">
                    <div className="opacity-40 text-[10px] font-bold text-rosy flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-teal rounded-md"></div>
                        CONNECTED AS APEX STAFF
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-mono text-rosy/50">{text.length}/300</span>
                        <Tooltip text="Submit your Spark for others to see">
                          <button 
                              type="submit"
                              className="px-8 py-3 bg-teal text-white rounded-md font-bold hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                              disabled={!text.trim()}
                          >
                              Spark It
                          </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
