"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const router = useRouter();

  // Show login page without sidebar or protection
  if (pathname === "/login") {
    return <main className="flex-1">{children}</main>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-canvas">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-md animate-spin"></div>
            <p className="text-[10px] font-bold text-rosy uppercase tracking-widest animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not logged in, AuthContext will handle redirect
  if (!user) {
    return null;
  }

  // Handle Admin only routes
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex-1 overflow-auto bg-canvas">
        {children}
      </div>
    </>
  );
}
