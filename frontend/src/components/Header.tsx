"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Spark It", href: "/" },
    { name: "Sparks", href: "/sparks" },
    { name: "Insights", href: "/visualizations" },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Settings", href: "/admin" });
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b border-line sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform">
              S
            </div>
            <span className="hidden md:block text-2xl font-serif text-teal tracking-tight">Spark</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 group ${
                    isActive
                      ? "bg-teal/10 text-teal font-semibold"
                      : "text-rosy hover:bg-teal/5 hover:text-stone-800"
                  }`}
                  title={item.name}
                >
                  <span className="text-[14px] uppercase tracking-wider font-bold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Section / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-tint transition-colors focus:outline-none"
            aria-label="User menu"
            title="Account Settings"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-stone-800 truncate leading-tight">{user?.display_name || user?.email}</p>
              <p className="text-[10px] font-bold text-teal uppercase tracking-tighter leading-tight">{user?.role}</p>
            </div>
            <div className="w-8 h-8 bg-canvas border border-line rounded-md flex items-center justify-center text-stone-800 text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg shadow-teal/5 py-2 animate-fade-in origin-top-right">
              <div className="px-4 py-2 border-b border-line/30 sm:hidden">
                <p className="text-xs font-bold text-stone-800 truncate">{user?.display_name || user?.email}</p>
                <p className="text-[10px] font-bold text-teal uppercase tracking-tighter">{user?.role}</p>
              </div>
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-copper hover:bg-copper/5 transition-colors flex items-center gap-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
