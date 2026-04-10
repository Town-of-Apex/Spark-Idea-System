"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import IdeaCard, { IdeaType } from "@/components/IdeaCard";
import { useAuth } from "@/context/AuthContext";
import PageTemplate from "@/components/PageTemplate";

const API_URL = "http://localhost:8000";

export default function VisualizationsPage() {
    const [allIdeas, setAllIdeas] = useState<IdeaType[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [wordcloud, setWordcloud] = useState<{ text: string; value: number }[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            fetchAllIdeas();
            fetchStats();
            fetchWordcloud();
        }
    }, [token]);

    const fetchAllIdeas = async () => {
        const res = await fetch(`${API_URL}/ideas/?limit=1000`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAllIdeas(await res.json());
    };

    const fetchStats = async () => {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(await res.json());
    };

    const fetchWordcloud = async () => {
        const res = await fetch(`${API_URL}/analytics/wordcloud`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setWordcloud(await res.json());
    };

    const getIdeaColor = (idea: IdeaType) => {
        if (idea.is_new) return "#F2A65A"; // Warm signal for new
        if (idea.tags.length > 0) return idea.tags[0].color;
        return "#5C6B73"; // Muted slate default
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
                color: getIdeaColor(idea),
                isNew: idea.is_new
            };
        }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    }, [allIdeas]);

    return (
        <PageTemplate
            title="Insights"
            maxWidth="max-w-6xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Stats & Word Cloud */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-surface p-6 rounded-xl border border-line shadow-sm">
                        <h3 className="text-xs uppercase font-bold text-rosy mb-6">Tags</h3>
                        <div className="space-y-4">
                            {allIdeas.reduce((acc: any, idea) => {
                                idea.tags.forEach(t => {
                                    acc[t.name] = (acc[t.name] || 0) + 1;
                                });
                                return acc;
                            }, {} as any) && Object.entries(
                                allIdeas.reduce((acc: any, idea) => {
                                    idea.tags.forEach(t => {
                                        acc[t.name] = { count: (acc[t.name]?.count || 0) + 1, color: t.color };
                                    });
                                    return acc;
                                }, {} as any)
                            ).map(([name, data]: [string, any]) => (
                                <div key={name} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold text-stone-800">
                                        <span>{name}</span>
                                        <span>{data.count}</span>
                                    </div>
                                    <div className="h-1.5 bg-inner rounded-md overflow-hidden">
                                        <div
                                            className="h-full rounded-md transition-all duration-1000"
                                            style={{
                                                width: `${(data.count / allIdeas.length) * 100}%`,
                                                backgroundColor: data.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {allIdeas.length === 0 && <p className="text-xs text-rosy italic">Waiting for sparks...</p>}
                        </div>
                    </section>

                    <section className="bg-surface p-6 rounded-xl border border-line shadow-sm">
                        <h3 className="text-xs uppercase font-bold text-rosy mb-6">Key Words</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center py-4 bg-inner rounded-xl">
                            {wordcloud.map((item, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontSize: `${Math.min(24, 10 + item.value * 2)}px`,
                                        opacity: Math.min(1, 0.4 + item.value * 0.1),
                                        color: i % 3 === 0 ? "var(--stone-800)" : "var(--teal)"
                                    }}
                                    className="font-serif leading-none hover:scale-110 transition-transform cursor-default"
                                >
                                    {item.text}
                                </span>
                            ))}
                            {wordcloud.length === 0 && <p className="text-xs text-rosy italic">Analyzing text density...</p>}
                        </div>
                    </section>
                </div>

                {/* Center/Right: Visuals & Activity */}
                <div className="lg:col-span-3 space-y-8">

                    {/* 1. IMPACT VS EFFORT MATRIX */}
                    <section className="bg-surface p-10 rounded-[32px] border border-line shadow-sm relative">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-2xl font-serif text-stone-800 mb-2">Impact vs Difficulty</h2>
                                <p className="text-sm text-rosy max-w-md">
                                    As estimated by AI.
                                </p>
                            </div>
                        </div>

                        {/* 4-Quadrant Matrix */}
                        <div className="relative w-full aspect-square md:aspect-video bg-canvas/30 rounded-2xl border border-line/20 overflow-visible p-12">

                            {/* Axes */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-line/40"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-line/40"></div>

                            {/* Labels */}
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-rosy tracking-[0.2em]">Implementation Difficulty →</span>
                            <span className="absolute -left-12 top-1/2 -rotate-90 origin-center -translate-y-1/2 text-[10px] uppercase font-bold text-rosy tracking-[0.2em]">Public Impact →</span>

                            {/* Quadrant Titles */}
                            <div className="absolute top-4 left-4 text-[9px] font-bold text-rosy/40 uppercase tracking-widest">Big Bets</div>
                            <div className="absolute top-4 right-4 text-[9px] font-bold text-rosy/40 uppercase tracking-widest text-right">Major Projects</div>
                            <div className="absolute bottom-4 left-4 text-[9px] font-bold text-rosy/40 uppercase tracking-widest">Quick Wins</div>
                            <div className="absolute bottom-4 right-4 text-[9px] font-bold text-rosy/40 uppercase tracking-widest text-right">Fill-ins</div>

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
                                    className="absolute z-50 bg-stone-800 text-white p-4 rounded-xl shadow-2xl w-64 pointer-events-none animate-in fade-in zoom-in duration-150"
                                    style={{
                                        left: `${hoveredPoint.x * 10}%`,
                                        top: `${100 - (hoveredPoint.y * 10)}%`,
                                        transform: 'translate(-50%, -120%)'
                                    }}
                                >
                                    <p className="text-xs font-bold mb-2 text-teal uppercase tracking-widest">{hoveredPoint.isNew ? "New Spark" : "Spark"}</p>
                                    <p className="text-sm font-medium leading-relaxed">{hoveredPoint.text}</p>
                                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[10px] opacity-60 uppercase font-bold">
                                        <span>Impact: {hoveredPoint.y}</span>
                                        <span>Difficulty: {hoveredPoint.x}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. SEMANTIC CONSTELLATION */}
                    <ConstellationView />

                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-serif text-stone-800">Recent Sparks</h2>
                            <span className="text-xs font-bold text-rosy uppercase tracking-widest bg-white px-3 py-1 rounded-md border border-line/30"></span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allIdeas.slice(0, 4).map(idea => (
                                <IdeaCard key={idea.id} idea={idea} onVote={() => { }} onUpdate={fetchAllIdeas} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </PageTemplate>
    );
}

function ConstellationView() {
    const FRICTION = 0.90; // Lower friction means nodes settle faster but move more decisively
    const ATTRACTION = 0.008; // Base attraction for links
    const REPULSION = 0.015; // Base repulsion to keep nodes separate
    const GRAVITY = 0.0008; // Center gravity

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<any[]>([]);
    const linksRef = useRef<any[]>([]);
    const hoveredRef = useRef<any>(null);
    const maxDistRef = useRef(200); // Tracks current spread for dynamic zoom
    const [hoveredNode, setHoveredNode] = useState<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const { token } = useAuth();

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/analytics/constellation`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                linksRef.current = data.links;
                // If nodes were already there, try to keep their positions
                const existingNodes = nodesRef.current;
                nodesRef.current = data.nodes.map((n: any) => {
                    const existing = existingNodes.find(ex => ex.id === n.id);
                    if (existing) return { ...n, ...existing };

                    // New nodes: place processing ones on periphery, clamped to dimensions
                    const angle = Math.random() * Math.PI * 2;
                    // Max radius should be half the smaller dimension to stay safe
                    const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.4;
                    const radius = n.processing ? maxRadius : Math.random() * (maxRadius * 0.6);

                    return {
                        ...n,
                        x: dimensions.width / 2 + Math.cos(angle) * radius,
                        y: dimensions.height / 2 + Math.sin(angle) * radius,
                        vx: 0,
                        vy: 0
                    };
                });
            });
    }, [token]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameId: number;

        const animate = () => {
            const { width, height } = dimensions;
            canvas.width = width;
            canvas.height = height;
            const nodes = nodesRef.current;
            const links = linksRef.current;

            // 1. Physics logic
            for (let i = 0; i < nodes.length; i++) {
                const p1 = nodes[i];

                for (let j = i + 1; j < nodes.length; j++) {
                    const p2 = nodes[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    if (dist < 200) {
                        const force = (200 - dist) * REPULSION;
                        p1.vx += (dx / dist) * force;
                        p1.vy += (dy / dist) * force;
                        p2.vx -= (dx / dist) * force;
                        p2.vy -= (dy / dist) * force;
                    }
                }

                links.forEach(l => {
                    if (l.source === p1.id || l.target === p1.id) {
                        const otherId = l.source === p1.id ? l.target : l.source;
                        const other = nodes.find(n => n.id === otherId);
                        if (other) {
                            const dx = p1.x - other.x;
                            const dy = p1.y - other.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const force = (dist - 50) * ATTRACTION * l.value;
                            p1.vx -= (dx / dist) * force;
                            p1.vy -= (dy / dist) * force;
                        }
                    }
                });

                const dx = (width / 2) - p1.x;
                const dy = (height / 2) - p1.y;
                p1.vx += dx * GRAVITY;
                p1.vy += dy * GRAVITY;

                p1.vx *= FRICTION;
                p1.vy *= FRICTION;
                p1.x += p1.vx;
                p1.y += p1.vy;
            }

            // 2. Dynamic Zoom Calculation
            let currentMax = 100;
            nodes.forEach(n => {
                const dist = Math.sqrt((n.x - width / 2) ** 2 + (n.y - height / 2) ** 2);
                if (dist > currentMax) currentMax = dist;
            });
            maxDistRef.current = maxDistRef.current * 0.95 + currentMax * 0.05;
            const scale = (Math.min(width, height) * 0.45) / maxDistRef.current;

            // --- DRAWING ---
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-width / 2, -height / 2);

            // 1. Draw Links
            ctx.lineWidth = 1.5 / scale; // Anti-scale line width
            links.forEach(l => {
                const s = nodes.find(n => n.id === l.source);
                const t = nodes.find(n => n.id === l.target);
                if (s && t) {
                    ctx.strokeStyle = `rgba(47, 111, 94, ${l.value * 0.4})`;
                    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
                }
            });

            // 2. Draw Nodes
            nodes.forEach(n => {
                const r = 7 / scale; // Anti-scale radius
                if (n.processing) {
                    const s = 1 + Math.sin(Date.now() * 0.005) * 0.2;
                    ctx.fillStyle = "rgba(242, 166, 90, 0.4)";
                    ctx.beginPath(); ctx.arc(n.x, n.y, (4 / scale) * s, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "#F2A65A"; ctx.setLineDash([2 / scale, 2 / scale]); ctx.stroke(); ctx.setLineDash([]);
                } else {
                    ctx.fillStyle = n.color;
                    ctx.shadowBlur = 10 / scale;
                    ctx.shadowColor = n.color + "44";
                    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }

                if (hoveredRef.current?.id === n.id) {
                    ctx.strokeStyle = "white"; ctx.lineWidth = 2 / scale;
                    ctx.beginPath(); ctx.arc(n.x, n.y, 12 / scale, 0, Math.PI * 2); ctx.stroke();
                }
            });

            ctx.restore();
            frameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(frameId);
    }, [dimensions]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = dimensions.width;
        const height = dimensions.height;
        const scale = (Math.min(width, height) * 0.45) / maxDistRef.current;

        // Un-scale mouse coords relative to center
        const mx = (e.clientX - rect.left - width / 2) / scale + width / 2;
        const my = (e.clientY - rect.top - height / 2) / scale + height / 2;

        const hit = nodesRef.current.find(n => {
            const dist = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
            return dist < (15 / scale);
        });

        if (hit !== hoveredNode) {
            setHoveredNode(hit || null);
            hoveredRef.current = hit || null;
        }
    };

    return (
        <section className="bg-stone-800 p-10 rounded-[40px] shadow-2xl relative overflow-hidden h-[550px]">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at center, #005a70 0%, transparent 70%)" }}></div>
            <div className="relative z-10 flex justify-between items-start mb-8 text-white">
                <div>
                    <h2 className="text-2xl font-serif mb-2">Similarity Constellation</h2>
                    <p className="text-sm text-white/40 max-w-sm">Semantic clusters using AI embeddings. Similar ideas drift closer together.</p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-white/10 rounded-md text-teal animate-pulse">GPU Accelerated</span>
            </div>

            <div className="relative w-full h-[400px]" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    className="w-full h-full cursor-crosshair"
                />

                {hoveredNode && (
                    <div
                        className="absolute z-50 bg-white text-stone-800 p-3 rounded-xl shadow-2xl w-48 pointer-events-none animate-in fade-in zoom-in duration-150 border border-teal/30"
                        style={{
                            left: `${hoveredNode.x}px`,
                            top: `${hoveredNode.y}px`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <p className="text-[10px] font-bold mb-1 text-teal uppercase">{hoveredNode.is_new ? "New Spark" : "Spark"}</p>
                        <p className="text-xs font-semibold leading-relaxed">{hoveredNode.text}</p>
                    </div>
                )}
            </div>

            <p className="text-center text-[9px] uppercase font-bold text-white/20 tracking-[0.4em] z-10 relative mt-4">Apex Semantic Mapping Engine</p>
        </section>
    );
}
