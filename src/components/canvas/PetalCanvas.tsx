import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = ['#f48c96', '#e86a82', '#ff94b4', '#ffa2be', '#ffd6e0', '#e5809e'];

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const shouldDisable =
      window.innerWidth < 768 ||
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldDisable) {
      canvas.style.display = 'none';
      return;
    }

    const maxPetals = 14;
    const lastSpawn = { x: -999, y: -999, time: 0 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const spawnPetal = (x: number, y: number) => {
      if (petalsRef.current.length >= maxPetals) {
        petalsRef.current.shift();
      }

      petalsRef.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.72,
        vy: Math.random() * 0.42 + 0.22,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.035,
        alpha: 0,
        size: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: 72 + Math.random() * 42,
      });
    };

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();

      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.5, s * 0.5, 0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.5, -s * 0.5, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      petalsRef.current = petalsRef.current.filter((petal) => petal.life < petal.maxLife);

      for (const petal of petalsRef.current) {
        petal.life += 1;
        const progress = petal.life / petal.maxLife;

        if (progress < 0.18) {
          petal.alpha = (progress / 0.18) * 0.88;
        } else if (progress > 0.72) {
          petal.alpha = ((1 - progress) / 0.28) * 0.88;
        } else {
          petal.alpha = 0.88;
        }

        petal.vx += Math.sin(petal.life * 0.035) * 0.01;
        petal.x += petal.vx;
        petal.y += petal.vy;
        petal.rotation += petal.rotationSpeed;

        drawPetal(petal);
      }

      if (petalsRef.current.length) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = 0;
      }
    };

    const startLoop = () => {
      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      const now = performance.now();
      const dist = Math.hypot(event.clientX - lastSpawn.x, event.clientY - lastSpawn.y);
      if (dist < 30 || now - lastSpawn.time < 80) return;

      spawnPetal(event.clientX, event.clientY);
      lastSpawn.x = event.clientX;
      lastSpawn.y = event.clientY;
      lastSpawn.time = now;
      startLoop();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" />;
}
