import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagicCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { damping: 22, stiffness: 170 });
  const ringY = useSpring(dotY, { damping: 22, stiffness: 170 });
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const canUseCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(canUseCursor);

    if (!canUseCursor) return;

    const onMove = (event: PointerEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      setHovering(Boolean(target.closest('button, a, input, textarea, select, [data-cursor]')));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 54 : 40,
          height: hovering ? 54 : 40,
          borderColor: hovering ? 'rgba(122, 139, 96, 0.8)' : 'rgba(183, 121, 122, 0.55)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="fixed left-0 top-0 z-[9998] rounded-full border bg-white/10 pointer-events-none backdrop-blur-[1px]"
      />
      <motion.div
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: hovering ? 0.7 : 1,
          backgroundColor: hovering ? '#7a8b60' : '#b7797a',
        }}
        className="fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full pointer-events-none"
      />
    </>
  );
}
