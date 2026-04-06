"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Spark It", href: "/", icon: "✨" },
  { name: "The Sparks", href: "/sparks", icon: "🔥" },
  { name: "Insights", href: "/visualizations", icon: "📊" },
  { name: "Settings", href: "/admin", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-line-gray h-screen sticky top-0 flex flex-col p-6 z-40">
      <div className="mb-10 px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-apex-green rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-apex-green/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-2xl font-serif text-deep-ink tracking-tight">Spark</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                isActive
                  ? "bg-apex-green/10 text-apex-green font-semibold"
                  : "text-muted-slate hover:bg-hover-tint hover:text-deep-ink"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span className="text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 bg-soft-canvas rounded-[16px] border border-line-gray/50">
        <p className="text-[11px] uppercase tracking-widest text-muted-slate font-bold mb-1">Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-soft-success rounded-full animate-pulse"></div>
          <span className="text-xs text-deep-ink font-medium">System Online</span>
        </div>
      </div>
    </aside>
  );
}
