"use client";

import { useEffect, useRef, useState } from "react";

const EnergyAnimation = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; type: string }>>([]);
  const energyOrbsRef = useRef<Array<{ x: number; y: number; progress: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize particles
      particlesRef.current = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 100,
        type: Math.random() > 0.6 ? "energy" : "dust",
      }));
      
      // Initialize energy orbs
      energyOrbsRef.current = Array.from({ length: 8 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        progress: Math.random(),
      }));
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current += 0.016;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2.2;
      
      // Theme-based colors - Premium industrial palette
      const colors = {
        bg: isDark 
          ? { start: "#050814", mid: "#0a0f1a", end: "#0f1520" }
          : { start: "#eef2f7", mid: "#e4e9f0", end: "#d8dfe8" },
        rig: isDark ? "#1f242c" : "#4a525c",
        rigStroke: isDark ? "#3a4552" : "#7a8590",
        drillBit: "#e67e22",
        drillBitCore: "#f39c12",
        water: "#00a8cc",
        waterGlow: "#00d4ff",
        solarPanel: isDark ? "#1a2a3a" : "#3a5568",
        solarFrame: isDark ? "#3a5568" : "#6a8598",
        energy: "#f1c40f",
        energyGlow: "#ffdd55",
        particles: isDark ? "#3498db" : "#2980b9",
        accent: "#00a8cc",
        glass: "rgba(255,255,255,0.05)",
      };
      
      // Premium animated gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width * 0.5, canvas.height);
      bgGradient.addColorStop(0, colors.bg.start);
      bgGradient.addColorStop(0.5, colors.bg.mid);
      bgGradient.addColorStop(1, colors.bg.end);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Floating energy orbs (background)
      energyOrbsRef.current.forEach((orb, idx) => {
        orb.progress += 0.002;
        if (orb.progress > 1) orb.progress = 0;
        
        const radius = 15 + Math.sin(timeRef.current * 0.5 + idx) * 5;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y + Math.sin(timeRef.current + idx) * 20, radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius);
        gradient.addColorStop(0, `${colors.energy}40`);
        gradient.addColorStop(1, `${colors.energy}00`);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Advanced particle system
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.5;
        
        if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50 || p.life > 100) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.life = 0;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = (Math.random() - 0.5) * 0.4;
        }
        
        const size = p.type === "energy" ? 2 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        const alpha = 0.15 + Math.sin(p.life * 0.1) * 0.1;
        ctx.fillStyle = p.type === "energy" 
          ? `rgba(241, 196, 15, ${alpha})`
          : `rgba(0, 168, 204, ${alpha * 0.5})`;
        ctx.fill();
      });
      
      // ============ LEFT: SOLAR PANEL SYSTEM ============
      const solarX = centerX - 300;
      const solarY = centerY - 50;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      
      // Solar panel support structure
      ctx.fillStyle = colors.rig;
      ctx.fillRect(solarX + 35, solarY + 85, 6, 70);
      ctx.fillRect(solarX + 115, solarY + 85, 6, 70);
      
      // Solar Panel 1 - Main
      ctx.save();
      ctx.shadowBlur = 10;
      const angle1 = Math.sin(timeRef.current * 0.3) * 0.02;
      ctx.translate(solarX + 45, solarY + 45);
      ctx.rotate(angle1);
      
      // Panel base
      ctx.fillStyle = colors.solarPanel;
      ctx.fillRect(0, 0, 100, 75);
      ctx.strokeStyle = colors.solarFrame;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 100, 75);
      
      // Solar cells with animated energy
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
          const energyPulse = Math.sin(timeRef.current * 3 + i * j) * 0.15 + 0.35;
          ctx.fillStyle = `rgba(0, 168, 204, ${energyPulse})`;
          ctx.fillRect(i * 25 + 3, j * 24 + 3, 21, 20);
          
          // Cell highlight
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(i * 25 + 3, j * 24 + 3, 10, 8);
        }
      }
      
      // Animated shine
      const shinePos = (timeRef.current * 80) % 140 - 40;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(shinePos, 0, 35, 75);
      ctx.restore();
      
      // Solar Panel 2 - Secondary
      ctx.save();
      ctx.translate(solarX + 45, solarY + 135);
      ctx.rotate(-angle1 * 0.8);
      ctx.fillStyle = colors.solarPanel;
      ctx.fillRect(0, 0, 100, 75);
      ctx.strokeStyle = colors.solarFrame;
      ctx.strokeRect(0, 0, 100, 75);
      
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
          const energyPulse = Math.cos(timeRef.current * 2.5 + i * j) * 0.12 + 0.38;
          ctx.fillStyle = `rgba(0, 168, 204, ${energyPulse})`;
          ctx.fillRect(i * 25 + 3, j * 24 + 3, 21, 20);
        }
      }
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect((timeRef.current * 70) % 140 - 40, 0, 30, 75);
      ctx.restore();
      
      // Premium Inverter System
      ctx.fillStyle = colors.rig;
      ctx.fillRect(solarX + 165, solarY + 70, 55, 65);
      ctx.fillStyle = colors.rigStroke;
      ctx.fillRect(solarX + 170, solarY + 75, 45, 55);
      
      // Inverter screen
      ctx.fillStyle = "#000000";
      ctx.fillRect(solarX + 177, solarY + 80, 32, 18);
      
      // Animated power display
      const powerOutput = 98.5 + Math.sin(timeRef.current * 2) * 1.2;
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillText(`${powerOutput.toFixed(1)}%`, solarX + 182, solarY + 93);
      
      // Status LEDs
      const ledColors = [
        Math.sin(timeRef.current * 5) > 0 ? "#00ff00" : "#00aa00",
        Math.sin(timeRef.current * 4.5) > 0 ? "#00ff00" : "#00aa00",
        Math.sin(timeRef.current * 6) > 0 ? "#ffaa00" : "#886600",
      ];
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(solarX + 180 + i * 10, solarY + 108, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ledColors[i];
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = ledColors[i];
      }
      
      // Energy waves from inverter
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(solarX + 220, solarY + 98);
        ctx.quadraticCurveTo(
          solarX + 240 + Math.sin(timeRef.current * 6 + i) * 8,
          solarY + 85 + i * 12,
          solarX + 260,
          solarY + 98
        );
        ctx.strokeStyle = `rgba(241, 196, 15, ${0.6 - i * 0.15})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      
      // ============ RIGHT: ADVANCED DRILLING RIG ============
      const rigX = centerX + 200;
      const rigBaseY = centerY;
      
      // Ground platform
      ctx.fillStyle = isDark ? "#151a22" : "#4a5560";
      ctx.fillRect(rigX - 80, rigBaseY + 55, 200, 8);
      ctx.fillStyle = isDark ? "#1a2028" : "#5a6670";
      ctx.fillRect(rigX - 75, rigBaseY + 63, 190, 4);
      
      // Drilling tower - Main structure
      ctx.shadowBlur = 15;
      const towerGradient = ctx.createLinearGradient(rigX - 35, rigBaseY - 120, rigX + 35, rigBaseY);
      towerGradient.addColorStop(0, colors.rig);
      towerGradient.addColorStop(1, `${colors.rig}cc`);
      
      ctx.beginPath();
      ctx.moveTo(rigX - 40, rigBaseY - 120);
      ctx.lineTo(rigX + 40, rigBaseY - 120);
      ctx.lineTo(rigX + 25, rigBaseY + 10);
      ctx.lineTo(rigX - 25, rigBaseY + 10);
      ctx.closePath();
      ctx.fillStyle = towerGradient;
      ctx.fill();
      ctx.strokeStyle = colors.rigStroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Tower crossbars with animated lights
      for (let i = 0; i < 6; i++) {
        const y = rigBaseY - 95 + i * 22;
        const width = 45 - i * 4;
        ctx.beginPath();
        ctx.moveTo(rigX - width, y);
        ctx.lineTo(rigX + width, y);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Blinking aviation lights
        if (i % 2 === 0) {
          const blinkRate = Math.sin(timeRef.current * 4 + i) > 0;
          ctx.beginPath();
          ctx.arc(rigX - width + 4, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = blinkRate ? "#ff3333" : "#ff8888";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rigX + width - 4, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Main drill pipe with rotation
      const drillOffset = Math.sin(timeRef.current * 4.5) * 1.2;
      const drillRotation = timeRef.current * 18;
      
      ctx.beginPath();
      ctx.moveTo(rigX, rigBaseY - 100);
      ctx.lineTo(rigX + drillOffset * 0.15, rigBaseY + 45);
      ctx.lineWidth = 12;
      ctx.strokeStyle = isDark ? "#9aa5b5" : "#7a8595";
      ctx.stroke();
      
      // Metallic sheen on pipe
      ctx.beginPath();
      ctx.moveTo(rigX - 2, rigBaseY - 95);
      ctx.lineTo(rigX - 2 + drillOffset * 0.1, rigBaseY + 40);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.stroke();
      
      // Rotating drill bit
      ctx.save();
      ctx.translate(rigX + drillOffset * 0.15, rigBaseY + 45);
      ctx.rotate(drillRotation);
      
      // Drill bit body
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(12, 15);
      ctx.lineTo(0, 8);
      ctx.lineTo(-12, 15);
      ctx.closePath();
      ctx.fillStyle = colors.drillBit;
      ctx.fill();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(230, 126, 34, 0.6)";
      
      // Diamond-tipped teeth
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        const x = Math.cos(angle) * 14;
        const y = Math.sin(angle) * 14 + 14;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y + 6);
        ctx.lineTo(x, y + 3);
        ctx.lineTo(x - 4, y + 6);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      
      // Core bit
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.drillBitCore;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      
      // Advanced water particle system
      for (let i = 0; i < 45; i++) {
        const angle = (timeRef.current * 14 + i * 0.6) % (Math.PI * 2);
        const radius = 22 + Math.sin(timeRef.current * 22 + i) * 7;
        const x = rigX + drillOffset * 0.15 + Math.cos(angle) * radius;
        const y = rigBaseY + 48 + Math.sin(angle) * radius * 0.45;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.8 + Math.sin(timeRef.current * 18 + i) * 0.8, 0, Math.PI * 2);
        const alpha = 0.65 - Math.sin(timeRef.current * 12 + i) * 0.25;
        ctx.fillStyle = `${colors.water}${Math.floor(alpha * 180 + 75).toString(16)}`;
        ctx.fill();
      }
      
      // Water fountain effect
      for (let i = 0; i < 25; i++) {
        const angle = (timeRef.current * 9 + i * 0.4) % (Math.PI * 2);
        const force = Math.sin(timeRef.current * 6 + i) * 12;
        const x = rigX + drillOffset * 0.15 + Math.cos(angle) * 14;
        const y = rigBaseY + 48 - Math.abs(Math.sin(angle)) * 35 - force;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.waterGlow}cc`;
        ctx.fill();
      }
      
      // Expanding water ripples
      for (let i = 0; i < 6; i++) {
        const rippleSize = 14 + i * 12;
        const rippleOffset = (timeRef.current * 2.8 + i) % 1;
        ctx.beginPath();
        ctx.ellipse(
          rigX + drillOffset * 0.15,
          rigBaseY + 52,
          rippleSize + rippleOffset * 18,
          (rippleSize + rippleOffset * 18) * 0.35,
          0, 0, Math.PI * 2
        );
        ctx.strokeStyle = `${colors.water}${Math.floor((0.55 - rippleOffset * 0.25) * 255).toString(16)}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Energetic sparks
      for (let i = 0; i < 20; i++) {
        const sparkAngle = timeRef.current * 28 + i;
        const sparkX = rigX + drillOffset * 0.15 + Math.cos(sparkAngle) * 19;
        const sparkY = rigBaseY + 46 + Math.sin(sparkAngle * 1.6) * 9;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.sin(timeRef.current * 40 + i) * 30 + 40}, 100%, 58%)`;
        ctx.fill();
      }
      
      // ============ ENERGY CONNECTION BETWEEN SYSTEMS ============
      const startX = solarX + 220;
      const startY = solarY + 98;
      const endX = rigX - 50;
      const endY = rigBaseY - 60;
      
      // Pulsing energy line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(241, 196, 15, ${0.25 + Math.sin(timeRef.current * 3) * 0.1})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Flowing energy particles
      for (let i = 0; i < 8; i++) {
        const progress = (timeRef.current * 1.5 + i * 0.125) % 1;
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 3) * 4;
        
        const particleSize = 3 + Math.sin(progress * Math.PI * 8) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize);
        gradient.addColorStop(0, `rgba(241, 196, 15, ${0.9 - progress * 0.3})`);
        gradient.addColorStop(1, `rgba(241, 196, 15, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Atmospheric glow effects
      ctx.shadowBlur = 25;
      ctx.shadowColor = colors.energyGlow;
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDark]);
  
  return <canvas ref={canvasRef} className="w-full h-full block" style={{ overflow: 'hidden' }} />;
};

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
    <section className="relative h-[32vh] min-h-[300px] max-h-[380px] overflow-hidden">
      {/* Premium Animation Background */}
      <div className="absolute inset-0 z-0">
        <EnergyAnimation isDark={isDark} />
      </div>
      
      {/* Sophisticated Gradient Overlay */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
        isDark 
          ? "bg-gradient-to-r from-black/60 via-black/30 to-transparent"
          : "bg-gradient-to-r from-white/60 via-white/30 to-transparent"
      }`} />
      
      {/* Content Container */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            {/* Ultra-Premium Title Animation */}
            <div className="overflow-hidden">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slideUp ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Our{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Projects
                  </span>
                  
                  {/* Premium Animated Underline */}
                  <svg className="absolute -bottom-2 left-0 w-full h-0.5" viewBox="0 0 300 6" preserveAspectRatio="none">
                    <path d="M0,3 Q75,0 150,3 T300,3" stroke="url(#underlineGradient)" fill="none" strokeWidth="2">
                      <animate 
                        attributeName="stroke-dasharray" 
                        from="0 300" 
                        to="300 0" 
                        dur="1.2s" 
                        fill="freeze"
                      />
                    </path>
                    <defs>
                      <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00a8cc" />
                        <stop offset="50%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#00a8cc" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </div>
            
            {/* Description with Premium Styling */}
            <div className="overflow-hidden mt-3 sm:mt-4">
              <p className={`text-sm sm:text-base md:text-lg max-w-xl leading-relaxed animate-slideUp delay-100 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                <span className="font-semibold text-cyan-500">Advanced drilling technology</span> and 
                {" "}<span className="font-semibold text-yellow-500">solar energy systems</span> powering 
                sustainable development across Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Elegant Bottom Fade */}
      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t pointer-events-none transition-all duration-700 ${
        isDark
          ? "from-black/40 via-black/15 to-transparent"
          : "from-white/40 via-white/15 to-transparent"
      }`} />
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </section>
  );
}