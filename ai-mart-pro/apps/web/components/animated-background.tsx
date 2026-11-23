'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AnimatedBackgroundProps {
  variant?: 'hero' | 'full' | 'subtle';
  className?: string;
  showGrid?: boolean;
  showParticles?: boolean;
  showCanvas?: boolean;
  showOrbitRings?: boolean;
}

export function AnimatedBackground({
  variant = 'hero',
  className = '',
  showGrid = true,
  showParticles = true,
  showCanvas = true,
  showOrbitRings = true
}: AnimatedBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // 1. Mouse movement tracking for cursor spotlight & canvas interactivity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePos({ x: -1000, y: -1000 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // 2. High-Performance Interactive HTML5 Canvas Constellation
  useEffect(() => {
    if (!showCanvas) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes definition
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 18000), 45);
    const particles = Array.from({ length: Math.max(22, PARTICLE_COUNT) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2.5 + 1.2,
      baseRadius: Math.random() * 2.5 + 1.2,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#0B7A6C' : '#f59e0b'
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw interactive connections
      const maxDist = 130;
      const mouseDist = 170;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particle
        p1.x += p1.vx * (dt * 60);
        p1.y += p1.vy * (dt * 60);

        // Gentle bounce off borders
        if (p1.x < 0) { p1.x = 0; p1.vx *= -1; }
        if (p1.x > width) { p1.x = width; p1.vx *= -1; }
        if (p1.y < 0) { p1.y = 0; p1.vy *= -1; }
        if (p1.y > height) { p1.y = height; p1.vy *= -1; }

        // Subtle pulsation
        p1.phase += dt * 2.2;
        p1.radius = p1.baseRadius + Math.sin(p1.phase) * 0.6;

        // Interaction with cursor
        const dxMouse = mousePos.x - p1.x;
        const dyMouse = mousePos.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseDist) {
          const strength = 1 - distMouse / mouseDist;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.strokeStyle = `rgba(11, 122, 108, ${0.48 * strength})`;
          ctx.lineWidth = 1.3 * strength;
          ctx.stroke();

          // Cursor attraction
          p1.x += (dxMouse / distMouse) * strength * 0.7;
          p1.y += (dyMouse / distMouse) * strength * 0.7;
        }

        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.32;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(11, 122, 108, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, Math.max(0.6, p1.radius), 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(11, 122, 108, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [showCanvas, mousePos]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      {/* 1. LAYER: Interactive Cursor Follower Spotlight */}
      {isHovered && mousePos.x > 0 && (
        <div
          className="absolute w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-[70px] opacity-75 z-0 transition-opacity duration-300"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            background: 'radial-gradient(circle, rgba(11, 122, 108,0.38) 0%, rgba(255,139,69,0.2) 40%, transparent 70%)'
          }}
        />
      )}

      {/* 2. LAYER: Fluid Aurora Mesh Gradient Blobs with Enhanced Radiance (CSS Animated for 100% Reliability) */}
      <div className="absolute inset-0 z-0">
        {/* Blob 1: Central Luminous Orange Sunburst */}
        <motion.div
          animate={{
            x: [-25, 30, -18, -25],
            y: [-15, 24, -20, -15],
            scale: [1, 1.15, 0.95, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[760px] h-[440px] rounded-full blur-[85px] opacity-80"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(11, 122, 108,0.42) 0%, rgba(255,139,69,0.28) 45%, rgba(254,215,170,0.18) 70%, transparent 85%)'
          }}
        />

        {/* Blob 2: Left Sunset Amber & Coral Core */}
        <motion.div
          animate={{
            x: [30, -25, 20, 30],
            y: [20, -20, 26, 20],
            scale: [1.08, 0.92, 1.15, 1.08]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[16%] left-[4%] w-[600px] h-[480px] rounded-full blur-[80px] opacity-65"
          style={{
            background: 'radial-gradient(circle, rgba(255,139,69,0.36) 0%, rgba(245,158,11,0.24) 50%, transparent 80%)'
          }}
        />

        {/* Blob 3: Right Warm Golden Ray */}
        <motion.div
          animate={{
            x: [-20, 35, -30, -20],
            y: [24, -24, 16, 24],
            scale: [0.94, 1.2, 0.92, 0.94]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[10%] right-[4%] w-[620px] h-[460px] rounded-full blur-[80px] opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.32) 0%, rgba(253,186,116,0.2) 50%, transparent 75%)'
          }}
        />

        {/* Blob 4: Bottom Rose/Peach Glow for Rich Depth */}
        <motion.div
          animate={{
            scale: [0.95, 1.18, 0.95],
            opacity: [0.4, 0.65, 0.4]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[36%] left-1/2 -translate-x-1/2 w-[780px] h-[360px] rounded-full blur-[95px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(11, 122, 108,0.25) 0%, rgba(255,139,69,0.18) 50%, transparent 80%)'
          }}
        />
      </div>

      {/* 3. LAYER: Concentric Orbital Radar Rings & Rotating Accelerator */}
      {showOrbitRings && (
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] pointer-events-none z-[1] opacity-60">
          {/* Outer Dashed Orbit Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-[#0B7A6C]/30"
          />

          {/* Middle Dotted Orbit Ring with Orbiting Tech Satellites */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[85px] rounded-full border border-dotted border-[#f59e0b]/35"
          >
            {/* Satellite tech node 1 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0B7A6C] shadow-[0_0_14px_#0B7A6C]" />
            {/* Satellite tech node 2 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]" />
            {/* Satellite tech node 3 */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#09665A] shadow-[0_0_10px_#09665A]" />
          </motion.div>

          {/* Inner Glowing Ring */}
          <motion.div
            animate={{ scale: [0.96, 1.05, 0.96], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[180px] rounded-full border border-[#0B7A6C]/40 shadow-[0_0_30px_rgba(11, 122, 108,0.2)]"
          />

          {/* Conic Ambient Light Sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[110px] rounded-full opacity-35 blur-md pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(11, 122, 108,0.45) 90deg, transparent 180deg)'
            }}
          />
        </div>
      )}

      {/* 4. LAYER: Interactive HTML5 Canvas Constellation Network */}
      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-[2] pointer-events-none opacity-90"
        />
      )}

      {/* 5. LAYER: Tech Dot Grid with Vignette Mask & Moving Laser Light Sweep */}
      {showGrid && (
        <div
          className="absolute inset-0 z-[3] opacity-85"
          style={{
            backgroundImage: 'radial-gradient(rgba(11, 122, 108, 0.32) 1.5px, transparent 1.5px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 38%, black 35%, transparent 88%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 38%, black 35%, transparent 88%)'
          }}
        >
          {/* Horizontal animated laser scanline */}
          <motion.div
            animate={{
              y: ['-10%', '240%']
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-x-0 h-44 bg-gradient-to-b from-transparent via-[rgba(11, 122, 108,0.18)] to-transparent pointer-events-none shadow-[0_0_24px_rgba(11, 122, 108,0.2)]"
          />
        </div>
      )}

      {/* 6. LAYER: Floating Tech Badge Sparks */}
      {showParticles && (
        <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
          {[
            { top: '15%', left: '12%', size: 'w-2 h-2', delay: 0 },
            { top: '25%', right: '14%', size: 'w-3 h-3', delay: 1.2 },
            { top: '45%', left: '8%', size: 'w-2.5 h-2.5', delay: 2.4 },
            { top: '55%', right: '10%', size: 'w-2 h-2', delay: 0.8 },
            { top: '35%', left: '22%', size: 'w-1.5 h-1.5', delay: 1.8 },
            { top: '65%', right: '20%', size: 'w-3 h-3', delay: 3.0 }
          ].map((pt, idx) => (
            <motion.div
              key={idx}
              animate={{
                y: [-8, 8, -8],
                opacity: [0.4, 0.9, 0.4],
                scale: [0.9, 1.2, 0.9]
              }}
              transition={{
                duration: 4 + idx * 0.5,
                delay: pt.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`absolute rounded-full bg-[#0B7A6C] shadow-[0_0_12px_#0B7A6C] ${pt.size}`}
              style={{ top: pt.top, left: pt.left, right: pt.right }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AnimatedBackground;
