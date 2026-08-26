import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Leaf, MessageCircle, PackageCheck, Sparkles, X, MessageSquare, Phone } from 'lucide-react';
import type { Bouquet, ShopSettings } from '../../types';

interface BouquetDetailProps {
  bouquet: Bouquet | null;
  onClose: () => void;
  settings: ShopSettings;
}

export default function BouquetDetail({ bouquet, onClose, settings }: BouquetDetailProps) {
  const zaloUrl = settings.zaloLink ? `${settings.zaloLink}` : `https://zalo.me`;
  const messengerUrl = settings.messengerLink ? `${settings.messengerLink}` : 'https://m.me';
  const instagramUrl = settings.instagramLink ? `${settings.instagramLink}` : 'https://instagram.com';

  return (
    <AnimatePresence>
      {bouquet && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#4a2437]/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            data-detail-panel
            className="fixed inset-4 z-50 grid overflow-hidden rounded-lg border border-white/70 bg-[#fffaf6] shadow-[0_24px_70px_rgba(64,45,54,0.18)] md:inset-8 md:grid-cols-[1.03fr_0.97fr]"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,250,246,0.98) 0%, rgba(255,247,248,0.98) 55%, rgba(250,250,244,0.96) 100%)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 190 }}
          >
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-md border border-[#eadfd3] bg-white/88 text-[#4a3745]/62 shadow-sm backdrop-blur-md transition-colors hover:text-[#302935]"
            >
              <X size={16} />
            </button>

            <div className="relative min-h-[320px] overflow-hidden bg-[#f7f1eb] md:min-h-full">
              <motion.img
                src={bouquet.image}
                alt={bouquet.name}
                className="h-full w-full object-cover"
                initial={{ scale: 1.02 }}
                animate={{ scale: [1.02, 1.045, 1.02] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#302935]/52 via-transparent to-white/4" />
              <div
                className="absolute inset-0 opacity-22 mix-blend-soft-light"
                style={{ background: bouquet.glowColor }}
              />

              <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8">
                <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/72">
                  {bouquet.category}
                </p>
                <h2
                  className="mt-2 text-4xl font-bold md:text-5xl"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {bouquet.name}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/86">{bouquet.style}</p>
              </div>
            </div>

            <div className="relative overflow-y-auto p-6 md:p-9 lg:p-10">
              <div className="relative">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#b7797a]">
                      Chi tiết bó hoa
                    </p>
                    <h3
                      className="mt-2 text-3xl font-bold leading-tight text-[#302935]"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {bouquet.name}
                    </h3>
                  </div>
                  <p className="shrink-0 rounded-md bg-[#302935] px-3 py-2 text-sm font-bold text-white">
                    {bouquet.price.toLocaleString('vi-VN')}₫
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#7a8b60]">{bouquet.style}</p>
                <p className="mt-3 text-sm leading-7 text-[#5c4457]">{bouquet.description}</p>

                <div className="mt-6 grid gap-4">
                  <section className="rounded-lg border border-[#eadfd3] bg-white/72 p-4">
                    <div className="mb-3 flex items-center gap-2 text-[#7a8b60]">
                      <Leaf size={15} />
                      <p className="text-[10px] font-bold uppercase tracking-[2px]">Loại hoa</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bouquet.flowerTypes.map((flower) => (
                        <span
                          key={flower}
                          className="rounded-md bg-[#f8f3ec] px-3 py-1.5 text-xs font-semibold text-[#7a6b67]"
                        >
                          {flower}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#eadfd3] bg-white/72 p-4">
                    <div className="mb-3 flex items-center gap-2 text-[#7a8b60]">
                      <CalendarDays size={15} />
                      <p className="text-[10px] font-bold uppercase tracking-[2px]">Phù hợp cho</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bouquet.occasion.map((occ) => (
                        <span
                          key={occ}
                          className="rounded-md border border-[#f1d8dc] bg-[#fff5f6] px-3 py-1.5 text-xs font-semibold text-[#b7797a]"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[#eadfd3] bg-white/72 p-4">
                      <div className="mb-3 flex items-center gap-2 text-[#7a8b60]">
                        <PackageCheck size={15} />
                        <p className="text-[10px] font-bold uppercase tracking-[2px]">Ghi chú</p>
                      </div>
                      <p className="text-sm leading-7 text-[#5c4457]">{bouquet.productNote}</p>
                    </div>
                    <div className="rounded-lg border border-[#eadfd3] bg-white/72 p-4">
                      <div className="mb-3 flex items-center gap-2 text-[#7a8b60]">
                        <Sparkles size={15} />
                        <p className="text-[10px] font-bold uppercase tracking-[2px]">Bảo quản</p>
                      </div>
                      <p className="text-sm leading-7 text-[#5c4457]">{bouquet.detail.careNote}</p>
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#eadfd3] bg-white/72 p-4">
                    <div className="mb-3 flex items-center gap-2 text-[#7a8b60]">
                      <MessageCircle size={15} />
                      <p className="text-[10px] font-bold uppercase tracking-[2px]">Gợi ý nhỏ</p>
                    </div>
                    <p className="text-sm leading-7 text-[#5c4457]">{bouquet.detail.butterflyDescription}</p>
                  </section>
                </div>

                <div className="mt-8 border-t border-[#eadfd3] pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b67] text-center mb-3">Liên hệ đặt ngay qua chat</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <a
                      href={zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2572e6] hover:bg-[#1a5ebf] py-3 px-4 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <MessageSquare size={14} /> Zalo Shop
                    </a>
                    <a
                      href={messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#803ef0] hover:bg-[#6c2edf] py-3 px-4 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <MessageCircle size={14} /> Messenger
                    </a>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e1306c] hover:bg-[#c22055] py-3 px-4 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                      Instagram
                    </a>
                  </div>
                  {settings.phone && (
                    <div className="mt-4 text-center">
                      <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a8b60] hover:underline">
                        <Phone size={13} /> Gọi hotline: {settings.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
