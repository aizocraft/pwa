"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkMode = document.documentElement.classList.contains("dark");
          setIsDark(isDarkMode);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative pt-4 md:pt-8 lg:pt-12 overflow-hidden bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      {/* Background (no gradients; relies on globals.css vars) */}
      <div className="absolute inset-0" />

      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 transition-colors duration-500 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Our{" "}
            <span className="text-cyan-500 dark:text-cyan-400">
              Projects
            </span>
          </h1>
          

          
          {/* Decorative Line */}
          <div className="w-16 h-0.5 bg-cyan-500 mx-auto mt-6 rounded-full" />
        </div>
      </div>
    </section>
  );
}