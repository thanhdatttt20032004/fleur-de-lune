import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5"
      style={{ background: 'linear-gradient(to bottom, rgba(15,10,26,0.7), transparent)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🌸</span>
        <span
          className="text-xl font-bold"
          style={{
            fontFamily: 'Playfair Display, serif',
            background: 'linear-gradient(135deg, #f8c4d4, #c9a96e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Fleur de Lune
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {['Bộ Sưu Tập', 'Dịch Vụ', 'Câu Chuyện', 'Liên Hệ'].map(item => (
          <button
            key={item}
            className="text-xs tracking-[2px] uppercase text-white/50 hover:text-pink-300 transition-colors duration-300"
          >
            {item}
          </button>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider text-white"
        style={{
          background: 'linear-gradient(135deg, #e8a0b4, #c9a96e)',
          boxShadow: '0 4px 20px rgba(232,160,180,0.3)',
        }}
      >
        Đặt Hoa
      </motion.button>
    </motion.nav>
  );
}
