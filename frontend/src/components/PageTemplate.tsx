"use client";
import React from "react";

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  headerContent?: React.ReactNode;
}

export default function PageTemplate({
  title,
  subtitle,
  description,
  children,
  maxWidth = "max-w-6xl",
  headerContent
}: PageTemplateProps) {
  return (
    <main className="w-full min-h-screen">
      <div className={`mx-auto px-6 sm:px-8 py-12 pb-32 w-full ${maxWidth}`}>
        <header className="mb-16">
          {description && (
            <p className="text-rosy font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
              {description}
            </p>
          )}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-line pb-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-teal mb-4 tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-rosy max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {headerContent && (
              <div className="flex-shrink-0">
                {headerContent}
              </div>
            )}
          </div>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </div>
    </main>
  );
}
