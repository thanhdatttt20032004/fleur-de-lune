import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADING_LINES = [
  'Đang chuẩn bị các mẫu hoa nổi bật...',
  'Đang sắp xếp ảnh và bảng giá...',
  'Sắp mở boutique hoa cho bạn...',
];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(LOADING_LINES[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      setLine(LOADING_LINES[i]);
    }, 800);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setVisible(false);
      setTimeout(onDone, 700);
    }, 2400);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fffaf6 0%, #fff2f4 52%, #f8fbf2 100%)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Spinning flower */}
          <motion.div
            className="mb-8 text-6xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            🌸
          </motion.div>

          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-3"
            style={{
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(135deg, #f8c4d4, #c9a96e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fleur de Lune
          </motion.h1>

          <motion.p
            key={line}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xs text-center text-sm tracking-widest text-[#7a6b67]/70"
          >
            {line}
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="mt-10 h-px bg-gradient-to-r from-transparent via-[#e8a0b4]/50 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
