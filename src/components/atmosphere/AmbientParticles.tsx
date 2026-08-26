/**
 * AmbientParticles — Atmospheric depth-layered floating dust
 *
 * Particles are divided into 3 depth planes:
 *   far (small, slow, dim)  →  mid  →  near (large, faster, brighter)
 * This reinforces the z-depth illusion alongside AtmosphericDepth blobs.
 *
 * Performance: single canvas, ~16 particles desktop / 0 mobile
 * Technique: direct canvas 2D draw in RAF loop, no DOM nodes
 */

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: string;
  depth: number;   // 0=far, 1=near
  phase: number;
  shape: 'circle' | 'petal';
  angle: number;
}

const PALETTE = ['#f3b8c9', '#ead2c7', '#dbe8c8', '#fff8ef', '#c9aecf', '#f5d7e3'];

export default function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Skip entirely on touch/mobile devices
    if (window.innerWidth < 768) {
      canvas.style.display = 'none';
      return;
    }

    const particles: Particle[] = [];
    let rafId = 0;
    let time = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Rebuild particles on resize
      particles.length = 0;

      const total = Math.min(16, Math.floor(window.innerWidth / 72));
      const countFar  = Math.floor(total * 0.45); // small, slow, many
      const countMid  = Math.floor(total * 0.35);
      const countNear = total - countFar - countMid; // large, fast, few

      const spawn = (depth: number) => {
        const speed = 0.04 + depth * 0.14;
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * speed * 0.7,
          vy: (-0.03 - Math.random() * speed),
          radius: 0.5 + depth * 2.8,
          alpha: 0.06 + depth * 0.16,
          hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          depth,
          phase: Math.random() * Math.PI * 2,
          shape: Math.random() < 0.3 ? 'petal' as const : 'circle' as const,
          angle: Math.random() * Math.PI * 2,
        };
      };

      for (let i = 0; i < countFar;  i++) particles.push(spawn(0.1 + Math.random() * 0.25));
      for (let i = 0; i < countMid;  i++) particles.push(spawn(0.35 + Math.random() * 0.25));
      for (let i = 0; i < countNear; i++) particles.push(spawn(0.65 + Math.random() * 0.35));
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        // Organic drift: multi-frequency sine on x, slow vy on y
        p.x += p.vx + Math.sin(time * 0.6 + p.phase) * 0.04 * (1 + p.depth);
        p.y += p.vy;
        p.angle += 0.004 * (1 + p.depth); // slowly rotate petals

        // Wrap around edges
        const margin = p.radius + 4;
        if (p.x < -margin) p.x = window.innerWidth + margin;
        if (p.x > window.innerWidth + margin) p.x = -margin;
        if (p.y < -margin) {
          p.y = window.innerHeight + margin;
          p.x = Math.random() * window.innerWidth;
        }

        // Shimmer effect
        const shimmer = 0.5 + Math.sin(time * 1.8 + p.phase) * 0.38;

        ctx.save();
        ctx.globalAlpha = p.alpha * shimmer;
        ctx.fillStyle = p.hue;
        ctx.shadowColor = p.hue;
        ctx.shadowBlur = 3 + p.depth * 8;

        if (p.shape === 'petal') {
          // Simple oval/petal shape via ellipse + rotation
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * 0.5, p.radius * (1 + p.depth * 0.6), 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(
            p.x, p.y,
            p.radius * (1 + p.depth * 0.5),
            p.radius * 0.6,
            p.phase * 0.5,
            0, Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[2]"
      style={{ opacity: 0.52 }}
    />
  );
}
