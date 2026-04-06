"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Spark It", href: "/", icon: "✨" },
    { name: "Sparks", href: "/sparks", icon: "🔥" },
    { name: "Insights", href: "/visualizations", icon: "📊" },
  ];

  // Only add settings for admins
  if (user?.role === "admin") {
    navItems.push({ name: "Settings", href: "/admin", icon: "⚙️" });
  }

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-line-gray h-screen sticky top-0 flex flex-col p-6 z-40 transition-all duration-300">
      <div className="mb-10 px-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-apex-green rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-apex-green/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="hidden md:block text-2xl font-serif text-deep-ink tracking-tight">Spark</span>
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
              <span className="hidden md:block text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto pt-6 border-t border-line-gray/10">
        <div className="bg-soft-canvas rounded-[20px] p-4 space-y-4 border border-line-gray/30">
            <div className="hidden md:block">
                <p className="text-[9px] uppercase font-bold text-muted-slate tracking-widest opacity-60 mb-0.5">Account</p>
                <p className="text-xs font-bold text-deep-ink truncate" title={user?.email}>{user?.display_name || user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-apex-green rounded-full shadow-[0_0_8px_rgba(47,111,94,0.5)]"></div>
                    <p className="text-[9px] font-bold text-apex-green uppercase tracking-tighter">{user?.role}</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="w-full py-2.5 bg-white hover:bg-warm-signal/5 hover:text-warm-signal border border-line-gray/50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2 group shadow-sm active:scale-95"
            >
                <span className="md:hidden text-lg">🚪</span>
                <span className="hidden md:block">Sign Out</span>
            </button>
        </div>
      </div>
    </aside>
  );
}
