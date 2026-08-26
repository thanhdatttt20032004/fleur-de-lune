/**
 * ButterflyCompanion — cinematic living butterfly
 *
 * Architecture:
 *  - useMotionValue + useSpring for silky organic position (very soft spring)
 *  - Curved arc paths: first move to perpendicular midpoint, redirect to dest
 *  - Z-depth simulation: scale changes create illusion of 3D space
 *  - Orbit behavior: slow elliptical RAF loop around bouquet center
 *  - Jitter: multi-frequency sine keyframes baked into body animate
 *  - Wing speed: 0.11s flapping when flying, 2.8s breathing when resting
 *  - Completely disabled on mobile (touch/narrow screens)
 */

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Bouquet } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  activeBouquet: Bouquet | null;
  selectedBouquet?: Bouquet | null;
  loaded: boolean;
}

type Mode = 'wandering' | 'landing' | 'hovering' | 'detail';

// ─── Dialogue pools ───────────────────────────────────────────────────────────

const IDLE_LINES = [
  'Hoa mới về hôm nay 🌸',
  'Mẫu này lên ảnh rất xinh.',
  'Pastel nhẹ và dễ tặng.',
];

const HOVER_LINES = [
  'Bó này đang được yêu thích 🌸',
  'Tone màu này rất nhẹ nhàng.',
  'Rất hợp để tặng sinh nhật.',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function safePoint(margin = 140) {
  const w = window.innerWidth, h = window.innerHeight;
  return {
    x: margin + Math.random() * (w - margin * 2),
    y: margin + Math.random() * (h - margin * 2),
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getAnchorPos(id: string): { x: number; y: number } | null {
  const el = document.querySelector<HTMLElement>(`[data-bouquet-anchor="${id}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * 0.6, y: r.top + r.height * 0.22 };
}

function getRandomAnchor(): { x: number; y: number } | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-bouquet-anchor]'));
  if (!els.length) return null;
  const el = pick(els);
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width * (0.4 + Math.random() * 0.28),
    y: r.top + r.height * (0.1 + Math.random() * 0.24),
  };
}

/**
 * Generate a curved arc midpoint perpendicular to the direct path.
 * The spring moves toward this midpoint, then we redirect to destination —
 * spring momentum creates a natural-looking curve.
 */
function arcMidpoint(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const perp = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
  const bend = Math.min(dist * 0.45, 210) * (Math.random() > 0.5 ? 1 : -1);
  const margin = 80;
  return {
    x: clamp(mx + Math.cos(perp) * bend, margin, window.innerWidth - margin),
    y: clamp(my + Math.sin(perp) * bend, margin, window.innerHeight - margin),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ButterflyCompanion({ activeBouquet, selectedBouquet, loaded }: Props) {
  // ── Device gate ───────────────────────────────────────────────────────────
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const ok =
      loaded &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      window.innerWidth >= 768;
    setEnabled(ok);
  }, [loaded]);

  // ── Position system ───────────────────────────────────────────────────────
  // Very soft spring → organic, momentum-heavy glide
  const mx = useMotionValue(typeof window !== 'undefined' ? window.innerWidth * 0.65 : 600);
  const my = useMotionValue(typeof window !== 'undefined' ? window.innerHeight * 0.3 : 200);
  const springX = useSpring(mx, { damping: 24, stiffness: 14, mass: 3.2, restDelta: 0.4 });
  const springY = useSpring(my, { damping: 24, stiffness: 14, mass: 3.2, restDelta: 0.4 });

  // ── Z-depth simulation (scale only, no expensive filter) ─────────────────
  const depthMV = useMotionValue(0.55);
  const depthSpring = useSpring(depthMV, { damping: 45, stiffness: 8, mass: 4.5 });
  const depthScale = useTransform(depthSpring, [0, 1], [0.44, 0.9]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('wandering');
  const modeRef = useRef<Mode>('wandering');

  const setModeBoth = (m: Mode) => { setMode(m); modeRef.current = m; };

  const [visible, setVisible] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const flyingRef = useRef(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [line, setLine] = useState('');

  // ── Timer management ──────────────────────────────────────────────────────
  const wanderIdRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const orbitRafRef = useRef(0);
  const timeoutSet = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutSet.current.delete(id);
      fn();
    }, ms);
    timeoutSet.current.add(id);
    return id;
  }, []);

  const stopOrbit = useCallback(() => {
    cancelAnimationFrame(orbitRafRef.current);
    orbitRafRef.current = 0;
  }, []);

  const clearAll = useCallback(() => {
    if (wanderIdRef.current) clearInterval(wanderIdRef.current);
    stopOrbit();
    timeoutSet.current.forEach(clearTimeout);
    timeoutSet.current.clear();
  }, [stopOrbit]);

  // ── Bubble ────────────────────────────────────────────────────────────────
  const lastBubbleAt = useRef(0);
  const bubbleClearId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showBubble = useCallback((text: string, dur = 2400) => {
    if (Date.now() - lastBubbleAt.current < 8500) return;
    lastBubbleAt.current = Date.now();
    setLine(text);
    setBubble(true);
    clearTimeout(bubbleClearId.current);
    bubbleClearId.current = setTimeout(() => setBubble(false), dur);
  }, []);

  // ── Current pos ref for arc calculation ───────────────────────────────────
  const posRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.65 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.3 : 200,
  });
  const cursorRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.58 : 560,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.42 : 320,
    seen: false,
  });
  const cursorFollowRafRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        cursorRef.current = {
          x: event.clientX,
          y: event.clientY,
          seen: true,
        };
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [enabled]);

  const stopCursorFollow = useCallback(() => {
    cancelAnimationFrame(cursorFollowRafRef.current);
    cursorFollowRafRef.current = 0;
  }, []);

  const startCursorFollow = useCallback(() => {
    stopCursorFollow();
    let t = Math.random() * 1000;

    const tick = () => {
      t += 0.016;
      if (modeRef.current === 'wandering' && cursorRef.current.seen && !flyingRef.current) {
        const current = posRef.current;
        const driftX = Math.sin(t * 0.58) * 92 + Math.sin(t * 0.19) * 42;
        const driftY = Math.cos(t * 0.44) * 66;
        const target = {
          x: clamp(cursorRef.current.x + 110 + driftX, 90, window.innerWidth - 90),
          y: clamp(cursorRef.current.y - 96 + driftY, 90, window.innerHeight - 90),
        };
        const next = {
          x: current.x + (target.x - current.x) * 0.01,
          y: current.y + (target.y - current.y) * 0.01,
        };
        mx.set(next.x);
        my.set(next.y);
        posRef.current = next;
      }
      cursorFollowRafRef.current = requestAnimationFrame(tick);
    };

    cursorFollowRafRef.current = requestAnimationFrame(tick);
  }, [mx, my, stopCursorFollow]);

  // ── Orbit: slow elliptical movement around anchor ─────────────────────────
  const startOrbit = useCallback(
    (center: { x: number; y: number }) => {
      stopOrbit();
      const radius = 28 + Math.random() * 24;
      const yRatio = 0.38 + Math.random() * 0.38; // elliptical
      const speed = 0.0035 + Math.random() * 0.003;
      let angle = Math.random() * Math.PI * 2;

      const tick = () => {
        const m = modeRef.current;
        if (m !== 'landing' && m !== 'hovering') return;
        angle += speed;
        const nx = center.x + Math.cos(angle) * radius;
        const ny = center.y + Math.sin(angle) * radius * yRatio;
        mx.set(nx);
        my.set(ny);
        posRef.current = { x: nx, y: ny };
        orbitRafRef.current = requestAnimationFrame(tick);
      };
      orbitRafRef.current = requestAnimationFrame(tick);
    },
    [mx, my, stopOrbit],
  );

  // ── Move with curved arc path ─────────────────────────────────────────────
  const moveTo = useCallback(
    (dest: { x: number; y: number }, curved = true) => {
      const from = posRef.current;
      const dist = Math.hypot(dest.x - from.x, dest.y - from.y);
      setFacingLeft(dest.x < from.x);

      // Animate depth (closer = scale up, farther = scale down)
      depthMV.set(0.22 + Math.random() * 0.78);

      setIsFlying(true);
      flyingRef.current = true;

      const travelMs = clamp(dist * 3.2, 1000, 2800);

      if (curved && dist > 160) {
        const arc = arcMidpoint(from, dest);
        // Phase 1: move toward arc midpoint (spring starts building momentum)
        mx.set(arc.x);
        my.set(arc.y);

        // Phase 2: redirect to destination while spring still has momentum
        addTimeout(() => {
          mx.set(dest.x);
          my.set(dest.y);
          posRef.current = dest;
          addTimeout(() => {
            setIsFlying(false);
            flyingRef.current = false;
          }, 1100);
        }, travelMs * 0.38);
      } else {
        mx.set(dest.x);
        my.set(dest.y);
        posRef.current = dest;
        addTimeout(() => {
          setIsFlying(false);
          flyingRef.current = false;
        }, travelMs * 0.5 + 600);
      }
    },
    [mx, my, depthMV, addTimeout],
  );

  // ── WANDERING LOGIC ───────────────────────────────────────────────────────
  const startWandering = useCallback(() => {
    if (wanderIdRef.current) clearInterval(wanderIdRef.current);
    stopOrbit();
    startCursorFollow();
    setModeBoth('wandering');

    const pt = safePoint();
    moveTo(pt);
    setVisible(true);

    wanderIdRef.current = setInterval(() => {
      if (modeRef.current !== 'wandering') return;

      const roll = Math.random();

      if (roll < 0.08 && cursorRef.current.seen) {
        moveTo(
          {
            x: clamp(cursorRef.current.x + (Math.random() - 0.5) * 180, 120, window.innerWidth - 120),
            y: clamp(cursorRef.current.y - 80 + (Math.random() - 0.5) * 120, 120, window.innerHeight - 120),
          },
          true,
        );
        setVisible(true);
        return;
      }

      // Occasionally drift to a bouquet and rest nearby.
      if (roll < 0.24) {
        const anchor = getRandomAnchor();
        if (anchor) {
          stopOrbit();
          setModeBoth('landing');
          moveTo(anchor, true);

          addTimeout(() => {
            if (modeRef.current === 'landing') {
              startOrbit(anchor);
              if (Math.random() < 0.18) showBubble(pick(IDLE_LINES), 2200);
            }
          }, 2100);

          addTimeout(() => {
            if (modeRef.current === 'landing') {
              stopOrbit();
              setModeBoth('wandering');
              moveTo(safePoint(), true);
            }
          }, 6800 + Math.random() * 3500);
          return;
        }
      }

      if (roll < 0.34) {
        setVisible(false);
        addTimeout(() => {
          const np = safePoint();
          // Jump position instantly while invisible
          mx.set(np.x);
          my.set(np.y);
          posRef.current = np;
          depthMV.set(0.3 + Math.random() * 0.5);
          setVisible(true);
          setModeBoth('wandering');
          moveTo(safePoint(), true);
        }, 1300);
        return;
      }

      // Default: smooth drift to new point
      moveTo(safePoint(), true);
      setVisible(true);
    }, 8200 + Math.random() * 3600);
  }, [addTimeout, depthMV, moveTo, mx, my, showBubble, startCursorFollow, startOrbit, stopOrbit]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(startWandering, 900);
    return () => {
      clearTimeout(t);
      clearAll();
      stopCursorFollow();
    };
  }, [enabled, startWandering, clearAll, stopCursorFollow]);

  // ── Hover reaction ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (activeBouquet) {
      if (wanderIdRef.current) clearInterval(wanderIdRef.current);
      stopOrbit();
      setModeBoth('hovering');
      setVisible(true);
      depthMV.set(0.72 + Math.random() * 0.28);

      const pos = getAnchorPos(activeBouquet.id);
      if (pos) {
        moveTo(pos, true);
        addTimeout(() => {
          if (modeRef.current === 'hovering') startOrbit(pos);
        }, 1500);
      }
      if (Math.random() < 0.55) {
        showBubble(pick(activeBouquet.hoverDialogues.length ? activeBouquet.hoverDialogues : HOVER_LINES), 2400);
      }
    } else {
      if (modeRef.current === 'hovering') {
        stopOrbit();
        startWandering();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBouquet, enabled]);

  // ── Detail modal ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (selectedBouquet) {
      clearAll();
      setModeBoth('detail');
      depthMV.set(0.9);
      setBubble(false);

      const raf = requestAnimationFrame(() => {
        const panel = document.querySelector<HTMLElement>('[data-detail-panel]');
        const dest = panel
          ? { x: panel.getBoundingClientRect().left + 80, y: panel.getBoundingClientRect().top + 60 }
          : { x: window.innerWidth * 0.72, y: window.innerHeight * 0.22 };
        moveTo(dest, false);
        setVisible(true);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      if (modeRef.current === 'detail') startWandering();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBouquet, enabled]);

  if (!enabled) return null;

  // Wing animation parameters
  const wingDur = isFlying ? 0.11 : 2.8;
  const wingRotAmp = isFlying ? 26 : 10;
  const wingScaleMin = isFlying ? 0.08 : 0.85;
  const isResting = mode === 'landing' || mode === 'hovering' || mode === 'detail';

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[45]"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        scale: depthScale,
      }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.9 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={line}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute top-[-74px] w-44 rounded-lg border border-white/72 bg-white/92 px-3 py-2 text-[11px] font-medium leading-[1.45] text-[#5f4c60] shadow-[0_12px_30px_rgba(88,62,74,0.12)] backdrop-blur-xl ${
              facingLeft ? 'right-6 text-right' : 'left-6'
            }`}
          >
            {line}
            <span
              className={`absolute -bottom-2 h-3 w-3 rotate-45 rounded-sm border-b border-r border-white/72 bg-white/92 ${
                facingLeft ? 'right-6' : 'left-6'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth glow – softly pulses, reacts to z-depth */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5bccd]"
        style={{ width: 42, height: 42, filter: 'blur(16px)' }}
        animate={{ opacity: isResting ? [0.12, 0.2, 0.12] : [0.05, 0.1, 0.05] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Butterfly body — organic multi-frequency floating + tilt during flight */}
      <motion.div
        className="relative h-12 w-16"
        animate={{
          // Multi-frequency jitter creates organic "alive" feel
          x: [0, 2.6, -1.7, 2.2, -2.4, 1.1, 0],
          y: isFlying
            ? [-11, 11, -11]
            : [0, 3.2, 0],
          rotate: isFlying
            ? facingLeft
              ? [-18, -5, -18]
              : [5, 18, 5]
            : [-4, 4, -4],
          scale: isResting ? 0.84 : 1,
        }}
        transition={{
          x: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.16, 0.32, 0.5, 0.68, 0.84, 1] },
          y: { duration: isFlying ? 0.48 : 4.0, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: isFlying ? 0.65 : 5.4, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.55 },
        }}
        style={{ willChange: 'transform' }}
      >
        <svg
          viewBox="0 0 120 92"
          className="relative h-full w-full overflow-visible"
          style={{ filter: 'drop-shadow(0 8px 18px rgba(123,89,102,0.18))' }}
        >
          <defs>
            <linearGradient id="butterfly_wA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#fff6f4" />
              <stop offset="48%"  stopColor="#f5b9cb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b99ac6" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="butterfly_wB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fffaf2" />
              <stop offset="52%"  stopColor="#f1c2d0" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#9fad83" stopOpacity="0.66" />
            </linearGradient>
          </defs>

          {/* Upper left wing */}
          <motion.path
            d="M58 43 C30 6 7 7 6 34 C5 61 35 67 58 47 Z"
            fill="url(#butterfly_wA)"
            opacity="0.92"
            animate={{
              rotate:  isFlying ? [-wingRotAmp, wingRotAmp * 0.38, -wingRotAmp]  : [-9, -2, -9],
              scaleX:  isFlying ? [wingScaleMin, 1.06, wingScaleMin]             : [0.86, 0.99, 0.86],
            }}
            transition={{ duration: wingDur, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ originX: '52%', originY: '50%', willChange: 'transform' }}
          />
          {/* Upper right wing */}
          <motion.path
            d="M62 43 C90 6 113 7 114 34 C115 61 85 67 62 47 Z"
            fill="url(#butterfly_wB)"
            opacity="0.9"
            animate={{
              rotate:  isFlying ? [wingRotAmp, -wingRotAmp * 0.38, wingRotAmp]  : [9, 2, 9],
              scaleX:  isFlying ? [wingScaleMin, 1.06, wingScaleMin]            : [0.86, 0.99, 0.86],
            }}
            transition={{ duration: wingDur, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ originX: '48%', originY: '50%', willChange: 'transform' }}
          />
          {/* Lower left wing */}
          <motion.path
            d="M56 47 C35 54 27 76 43 84 C56 91 61 68 59 49 Z"
            fill="url(#butterfly_wB)"
            opacity="0.6"
            animate={{
              rotate:  isFlying ? [-18, 8, -18] : [-5, 0, -5],
              scaleX:  isFlying ? [0.12, 1.0, 0.12] : [0.9, 0.98, 0.9],
            }}
            transition={{ duration: wingDur, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ originX: '52%', originY: '46%', willChange: 'transform' }}
          />
          {/* Lower right wing */}
          <motion.path
            d="M64 47 C85 54 93 76 77 84 C64 91 59 68 61 49 Z"
            fill="url(#butterfly_wA)"
            opacity="0.56"
            animate={{
              rotate:  isFlying ? [18, -8, 18] : [5, 0, 5],
              scaleX:  isFlying ? [0.12, 1.0, 0.12] : [0.9, 0.98, 0.9],
            }}
            transition={{ duration: wingDur, repeat: Infinity, ease: 'easeInOut' as const }}
            style={{ originX: '48%', originY: '46%', willChange: 'transform' }}
          />

          {/* Body */}
          <path d="M60 35 C55 45 55 60 60 70 C65 60 65 45 60 35 Z" fill="#6b536b" opacity="0.76" />
          {/* Antennae */}
          <path d="M58 36 C50 28 45 22 40 15" stroke="#6b536b" strokeWidth="1.2" strokeLinecap="round" opacity="0.46" />
          <path d="M62 36 C70 28 75 22 80 15" stroke="#6b536b" strokeWidth="1.2" strokeLinecap="round" opacity="0.46" />
          <circle cx="39" cy="14" r="1.3" fill="#c891a5" opacity="0.68" />
          <circle cx="81" cy="14" r="1.3" fill="#c891a5" opacity="0.68" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
