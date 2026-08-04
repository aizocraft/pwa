"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--background))] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,157,255,0.12),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
          Gallery
        </div>

        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Our Project Gallery
        </h1>


      </div>
    </section>
  );
}