"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--background))] px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16 lg:px-12 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,157,255,0.12),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
          Trusted installations
        </div>

        <h1 className={`text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl ${isDark ? "text-white" : "text-slate-900"}`}>
          Our
          <span className="ml-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent">
            Projects
          </span>
        </h1>

        <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base md:text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          From solar systems to water solutions, we deliver dependable projects built for performance, durability, and long-term value.
        </p>

        <div className="mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
      </div>
    </section>
  );
}