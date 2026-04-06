"use client";
import { useState } from "react";

export default function PromptHeader({ onIdeaSubmit }: { onIdeaSubmit: (text: string, username: string) => void }) {
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onIdeaSubmit(text, username.trim() || "Anonymous");
      setText("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-12 md:my-20 text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-deep-ink mb-6 tracking-tight">What if we&hellip;</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center relative">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          autoFocus
          placeholder="simplify the permit application process for new businesses?"
          className="w-full text-xl md:text-2xl p-6 rounded-[16px] border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-apex-green transition-shadow placeholder:text-muted-slate/50 text-deep-ink"
        />
        <div className="flex w-full justify-between items-center px-2 mt-2">
            <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Name (Optional)"
                className="text-sm p-2 bg-transparent border-b border-line-gray focus:outline-none focus:border-apex-green transition-colors w-48 text-deep-ink placeholder:text-muted-slate"
            />
            <div className="flex gap-4 items-center">
                <span className="text-xs text-muted-slate font-mono">{text.length}/300</span>
                <button 
                type="submit"
                className="px-6 py-2.5 bg-apex-green text-white rounded-full font-medium hover:bg-[#286051] hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                disabled={!text.trim()}
                >
                Spark It
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}
