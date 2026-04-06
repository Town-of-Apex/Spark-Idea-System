"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import IdeaCard, { IdeaType } from "@/components/IdeaCard";

const API_URL = "http://localhost:8000";

export default function VisualizationsPage() {
  const [allIdeas, setAllIdeas] = useState<IdeaType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [wordcloud, setWordcloud] = useState<{ text: string; value: number }[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  useEffect(() => {
    fetchAllIdeas();
    fetchStats();
    fetchWordcloud();
  }, []);

  const fetchAllIdeas = async () => {
    const res = await fetch(`${API_URL}/ideas/?limit=1000`);
    setAllIdeas(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/admin/stats`);
    setStats(await res.json());
  };

  const fetchWordcloud = async () => {
    const res = await fetch(`${API_URL}/analytics/wordcloud`);
    setWordcloud(await res.json());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "#5C6B73";
      case "in progress": return "#5DA9E9";
      case "implemented": return "#2F6F5E";
      case "reviewing": return "#F2A65A";
      default: return "#E2E8E5";
    }
  };

  // Matrix Dots Logic
  const matrixPoints = useMemo(() => {
    return allIdeas.map(idea => {
      const difficulty = parseFloat(idea.ai_metadata?.["Implementation Difficulty"] || "5");
      const impact = parseFloat(idea.ai_metadata?.["Public Impact"] || "5");
      return {
        id: idea.id,
        text: idea.text,
        x: difficulty, // Implementation Difficulty on X
        y: impact,     // Public Impact on Y
        color: getStatusColor(idea.status),
        status: idea.status
      };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
  }, [allIdeas]);

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl font-serif text-deep-ink mb-2">Insights & Visualizations</h1>
        <p className="text-muted-slate font-medium uppercase tracking-widest text-xs">AI-Powered Analytics for Apex</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Stats & Word Cloud */}
        <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-[24px] border border-line-gray/30 shadow-sm">
                <h3 className="text-xs uppercase font-bold text-muted-slate mb-6">Status Spread</h3>
                <div className="space-y-4">
                    {Object.entries(stats?.ideas_by_status || {}).map(([status, count]: [string, any]) => (
                        <div key={status} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-deep-ink">
                                <span>{status}</span>
                                <span>{count}</span>
                            </div>
                            <div className="h-1.5 bg-soft-canvas rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000" 
                                    style={{ 
                                        width: `${(count / (stats?.total_ideas || 1)) * 100}%`,
                                        backgroundColor: getStatusColor(status)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white p-6 rounded-[24px] border border-line-gray/30 shadow-sm">
                <h3 className="text-xs uppercase font-bold text-muted-slate mb-6">Keyword Pulse</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center py-4">
                    {wordcloud.map((item, i) => (
                        <span 
                            key={i} 
                            style={{ 
                                fontSize: `${Math.min(24, 10 + item.value * 2)}px`,
                                opacity: Math.min(1, 0.4 + item.value * 0.1),
                                color: i % 3 === 0 ? "var(--deep-ink)" : "var(--apex-green)"
                            }}
                            className="font-serif leading-none hover:scale-110 transition-transform cursor-default"
                        >
                            {item.text}
                        </span>
                    ))}
                    {wordcloud.length === 0 && <p className="text-xs text-muted-slate italic">Analyzing text density...</p>}
                </div>
            </section>
        </div>

        {/* Center/Right: Visuals & Activity */}
        <div className="lg:col-span-3 space-y-8">
            
            {/* 1. IMPACT VS EFFORT MATRIX */}
            <section className="bg-white p-10 rounded-[32px] border border-line-gray/40 shadow-sm relative">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-2xl font-serif text-deep-ink mb-2">Strategic Impact Matrix</h2>
                        <p className="text-sm text-muted-slate max-w-md">
                            Strategic prioritization using AI-estimated metrics.
                        </p>
                    </div>
                </div>
                
                {/* 4-Quadrant Matrix */}
                <div className="relative w-full aspect-square md:aspect-video bg-soft-canvas/30 rounded-2xl border border-line-gray/20 overflow-visible p-12">
                   
                    {/* Axes */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-line-gray/40"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-line-gray/40"></div>

                    {/* Labels */}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-muted-slate tracking-[0.2em]">Implementation Difficulty →</span>
                    <span className="absolute -left-12 top-1/2 -rotate-90 origin-center -translate-y-1/2 text-[10px] uppercase font-bold text-muted-slate tracking-[0.2em]">Public Impact →</span>

                    {/* Quadrant Titles */}
                    <div className="absolute top-4 left-4 text-[9px] font-bold text-muted-slate/40 uppercase tracking-widest">Big Bets</div>
                    <div className="absolute top-4 right-4 text-[9px] font-bold text-muted-slate/40 uppercase tracking-widest text-right">Major Projects</div>
                    <div className="absolute bottom-4 left-4 text-[9px] font-bold text-muted-slate/40 uppercase tracking-widest">Quick Wins</div>
                    <div className="absolute bottom-4 right-4 text-[9px] font-bold text-muted-slate/40 uppercase tracking-widest text-right">Fill-ins</div>

                    {/* Points */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {matrixPoints.map((point) => (
                            <circle 
                                key={point.id}
                                cx={point.x * 10} 
                                cy={100 - (point.y * 10)} 
                                r="1.5"
                                fill={point.color}
                                className="cursor-pointer hover:r-[3] transition-all duration-300 drop-shadow-sm"
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        ))}
                    </svg>

                    {/* Hover Card */}
                    {hoveredPoint && (
                        <div 
                            className="absolute z-50 bg-deep-ink text-white p-4 rounded-xl shadow-2xl w-64 pointer-events-none animate-in fade-in zoom-in duration-150"
                            style={{ 
                                left: `${hoveredPoint.x * 10}%`, 
                                top: `${100 - (hoveredPoint.y * 10)}%`,
                                transform: 'translate(-50%, -120%)'
                            }}
                        >
                            <p className="text-xs font-bold mb-2 text-apex-green uppercase tracking-widest">{hoveredPoint.status}</p>
                            <p className="text-sm font-medium leading-relaxed">{hoveredPoint.text}</p>
                            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[10px] opacity-60 uppercase font-bold">
                                <span>Impact: {hoveredPoint.y}</span>
                                <span>Effort: {hoveredPoint.x}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 2. SEMANTIC CONSTELLATION */}
            <ConstellationView />

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-serif text-deep-ink">Recent Spark Patterns</h2>
                    <span className="text-xs font-bold text-muted-slate uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-line-gray/30">Analytics Snapshot</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allIdeas.slice(0, 4).map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onVote={() => {}} onUpdate={fetchAllIdeas} />
                    ))}
                </div>
            </section>
        </div>
      </div>
    </main>
  );
}

function ConstellationView() {
    const FRICTION = 0.94;
    const ATTRACTION = 0.006;
    const REPULSION = 0.01;
    const GRAVITY = 0.0006;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<any[]>([]);
    const linksRef = useRef<any[]>([]);
    const hoveredRef = useRef<any>(null);
    const [hoveredNode, setHoveredNode] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_URL}/analytics/constellation`)
            .then(res => res.json())
            .then(data => {
                linksRef.current = data.links;
                nodesRef.current = data.nodes.map((n: any) => ({
                    ...n,
                    x: Math.random() * 800, // Using pixel coords for canvas
                    y: Math.random() * 400,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6
                }));
            });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameId: number;

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;
            const nodes = nodesRef.current;
            const links = linksRef.current;

            // 1. Clear Canvas
            ctx.clearRect(0, 0, width, height);

            // 2. Physics logic
            for (let i = 0; i < nodes.length; i++) {
                const p1 = nodes[i];
                
                // Repulsion
                for (let j = i + 1; j < nodes.length; j++) {
                    const p2 = nodes[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    if (dist < 150) {
                        const force = (150 - dist) * REPULSION;
                        p1.vx += (dx / dist) * force;
                        p1.vy += (dy / dist) * force;
                        p2.vx -= (dx / dist) * force;
                        p2.vy -= (dy / dist) * force;
                    }
                }

                // Attraction
                links.forEach(l => {
                    if (l.source === p1.id || l.target === p1.id) {
                        const other = nodes.find(n => n.id === (l.source === p1.id ? l.target : l.source));
                        if (other) {
                            const dx = p1.x - other.x;
                            const dy = p1.y - other.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const force = dist * l.value * ATTRACTION * 0.1;
                            p1.vx -= (dx / dist) * force;
                            p1.vy -= (dy / dist) * force;
                        }
                    }
                });

                // Center Gravity & Friction
                const dx = (width / 2) - p1.x;
                const dy = (height / 2) - p1.y;
                p1.vx = (p1.vx + dx * GRAVITY) * FRICTION;
                p1.vy = (p1.vy + dy * GRAVITY) * FRICTION;
                p1.x += p1.vx;
                p1.y += p1.vy;
            }

            // 3. Draw Links
            ctx.lineWidth = 1;
            links.forEach(l => {
                const s = nodes.find(n => n.id === l.source);
                const t = nodes.find(n => n.id === l.target);
                if (s && t) {
                    ctx.strokeStyle = `rgba(47, 111, 94, ${l.value * 0.3})`;
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(t.x, t.y);
                    ctx.stroke();
                }
            });

            // 4. Draw Nodes
            nodes.forEach(n => {
                ctx.fillStyle = n.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = n.color + "44";
                ctx.beginPath();
                ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Active hover circle
                if (hoveredRef.current?.id === n.id) {
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            frameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(frameId);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const hit = nodesRef.current.find(n => {
            const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
            return dist < 15;
        });

        if (hit !== hoveredNode) {
            setHoveredNode(hit || null);
            hoveredRef.current = hit || null;
        }
    };

    return (
        <section className="bg-deep-ink p-10 rounded-[40px] shadow-2xl relative overflow-hidden h-[550px]">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at center, #2F6F5E 0%, transparent 70%)" }}></div>
            <div className="relative z-10 flex justify-between items-start mb-8 text-white">
                <div>
                    <h2 className="text-2xl font-serif mb-2">Similarity Constellation</h2>
                    <p className="text-sm text-white/40 max-w-sm">Semantic clusters using AI embeddings. Similar ideas drift closer together.</p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-white/10 rounded-full text-apex-green animate-pulse">GPU Accelerated</span>
            </div>

            <div className="relative w-full h-[400px]">
                <canvas 
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onMouseMove={handleMouseMove}
                    className="w-full h-full cursor-crosshair"
                />

                {hoveredNode && (
                    <div 
                        className="absolute z-50 bg-white text-deep-ink p-3 rounded-xl shadow-2xl w-48 pointer-events-none animate-in fade-in zoom-in duration-150 border border-apex-green/30"
                        style={{ 
                            left: `${(hoveredNode.x / 800) * 100}%`, 
                            top: `${(hoveredNode.y / 400) * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <p className="text-[10px] font-bold mb-1 text-apex-green uppercase">{hoveredNode.status}</p>
                        <p className="text-xs font-semibold leading-relaxed">{hoveredNode.text}</p>
                    </div>
                )}
            </div>
            
            <p className="text-center text-[9px] uppercase font-bold text-white/20 tracking-[0.4em] z-10 relative mt-4">Apex Semantic Mapping Engine</p>
        </section>
    );
}
