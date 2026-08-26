import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Feather,
  Gift,
  Heart,
  Leaf,
  MessageCircle,
  Send,
  Sparkles,
  Star,
  Truck,
  Search,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Unlock,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';

import { db, formatPrice } from './services/db';
import type { Bouquet, ShopSettings } from './types';

import AmbientParticles from './components/atmosphere/AmbientParticles';
import BouquetDetail from './components/bouquets/BouquetDetail';
import ButterflyCompanion from './components/butterfly/ButterflyCompanion';
import PetalCanvas from './components/canvas/PetalCanvas';
import MagicCursor from './components/cursor/MagicCursor';
import LoadingScreen from './components/ui/LoadingScreen';
import AdminDashboard from './pages/AdminDashboard';

type PointerState = {
  x: number;
  y: number;
};

type TiltState = {
  x: number;
  y: number;
};

const serviceNotes = [
  { icon: Truck, title: 'Giao nhanh 2 giờ', text: 'Hỗ trợ giao nội thành HCMC, giữ hoa ẩm khi vận chuyển.' },
  { icon: MessageCircle, title: 'Đặt qua inbox', text: 'Chốt mẫu nhanh qua Zalo, Messenger hoặc Instagram.' },
  { icon: Gift, title: 'Quà tặng tinh tế', text: 'Thiệp nhỏ xinh và ruy băng được phối màu theo hoa.' },
];

function getHeroOffset(pointer: PointerState, amount: number) {
  return {
    x: pointer.x * amount,
    y: pointer.y * amount,
  };
}

function AtmosphericDepth({
  pointer,
  activeBouquet,
}: {
  pointer: PointerState;
  activeBouquet: Bouquet | null;
}) {
  const color = activeBouquet?.color ?? '#ffb3c1';

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div
        className="absolute left-[-18%] top-[-16%] h-[70vh] w-[72vw] rotate-[-8deg] rounded-[62%_38%_52%_48%] blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}24, rgba(255,250,246,0.02) 70%)`,
          x: pointer.x * -2,
          y: pointer.y * -2,
          opacity: 0.22,
        }}
        animate={{ scale: [1, 1.025, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-16%] h-[58vh] w-[54vw] rotate-[10deg] rounded-[42%_58%_38%_62%] blur-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(122,139,96,0.16), rgba(255,245,240,0.02) 70%)',
          x: pointer.x * 4,
          y: pointer.y * 4,
          opacity: 0.2,
        }}
        animate={{ scale: [1.01, 0.99, 1.01] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{ background: 'linear-gradient(to top, rgba(255,250,246,0.58), transparent)' }}
      />
    </div>
  );
}

// ─── CUSTOMER PAGE ────────────────────────────────────────────────────────────
function CustomerPage() {
  const [loaded, setLoaded] = useState(false);
  const [hoveredBouquet, setHoveredBouquet] = useState<Bouquet | null>(null);
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);
  const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0 });

  // Dynamic Data
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under400' | '400to600' | 'over600'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedOccasion, priceFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Load products and settings
    setProducts(db.getProducts());
    const shopSettings = db.getSettings();
    setSettings(shopSettings);
    
    // Set dynamic page title
    document.title = `${shopSettings.shopName} - Modern Flower Boutique`;
  }, []);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  const heroBouquet = activeProducts[1] ?? activeProducts[0] ?? null;
  const activeBouquet = hoveredBouquet ?? selectedBouquet ?? heroBouquet;
  
  const heroStack = useMemo(() => {
    return activeProducts.slice(0, 4);
  }, [activeProducts]);

  // Extract dynamic filters from active products
  const categoriesList = useMemo(() => {
    const cats = activeProducts.map(p => p.category);
    return ['all', ...Array.from(new Set(cats))];
  }, [activeProducts]);

  const occasionsList = useMemo(() => {
    const occs = activeProducts.flatMap(p => p.occasion);
    return ['all', ...Array.from(new Set(occs))];
  }, [activeProducts]);

  // Occasions Showcase List with Icons
  const occasionShowcase = useMemo(() => {
    const defaultOccasions = [
      { icon: Star, title: 'Sinh nhật', text: 'Mẫu hoa pastel ngọt ngào làm ngày đặc biệt thêm rạng rỡ.' },
      { icon: Heart, title: 'Kỷ niệm', text: 'Form bó tròn đầy đặn chỉn chu thể hiện tình cảm bền lâu.' },
      { icon: MessageCircle, title: 'Cảm ơn / Xin lỗi', text: 'Tone màu dịu nhẹ lịch sự gửi đi sự trân trọng chân thành.' },
      { icon: CalendarDays, title: 'Hoa hằng ngày', text: 'Mức giá thân thiện cắm bàn giúp không gian ngập tràn sức sống.' },
      { icon: Sparkles, title: 'Chụp ảnh', text: 'Form bồng bềnh như mây, lên hình xinh xắn cực bắt mắt.' },
    ];
    return defaultOccasions;
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchFlowers = p.flowerTypes.some(f => f.toLowerCase().includes(q));
        const matchOcc = p.occasion.some(o => o.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchFlowers && !matchOcc) return false;
      }
      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Occasion
      if (selectedOccasion !== 'all' && !p.occasion.includes(selectedOccasion)) {
        return false;
      }
      // Price
      if (priceFilter === 'under400' && p.price >= 400000) return false;
      if (priceFilter === '400to600' && (p.price < 400000 || p.price > 600000)) return false;
      if (priceFilter === 'over600' && p.price <= 600000) return false;

      return true;
    });
  }, [activeProducts, searchQuery, selectedCategory, selectedOccasion, priceFilter]);

  const PRODUCTS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPointer({
          x: (event.clientX / window.innerWidth - 0.5) * 2,
          y: (event.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  const handleHover = useCallback((bouquet: Bouquet | null) => {
    setHoveredBouquet(bouquet);
  }, []);

  const handleSelect = useCallback((bouquet: Bouquet) => {
    setSelectedBouquet(bouquet);
  }, []);

  const handleOccasionSelect = useCallback((title: string) => {
    setSelectedOccasion(title);
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleClose = useCallback(() => {
    setSelectedBouquet(null);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setPriceFilter('all');
  };

  return (
    <>
      <LoadingScreen onDone={() => setLoaded(true)} />
      <MagicCursor />
      <PetalCanvas />
      <ButterflyCompanion
        activeBouquet={hoveredBouquet}
        selectedBouquet={selectedBouquet}
        loaded={loaded}
      />

      <div
        className="min-h-screen overflow-x-hidden text-[#302935]"
        style={{
          background: 'linear-gradient(180deg, #fffaf6 0%, #fbf4ef 44%, #fff7f9 100%)',
          cursor: 'none',
        }}
      >
        <motion.div
          className="pointer-events-none fixed inset-0 z-0 opacity-40"
          animate={{ background: activeBouquet?.glowColor ?? 'transparent' }}
          transition={{ duration: 0.8 }}
        />
        <AmbientParticles />
        <AtmosphericDepth pointer={pointer} activeBouquet={activeBouquet} />

        {/* Header */}
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#e8decf]/70 bg-[#fffaf6]/90 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <a href="#top" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md border border-[#ded2c1] bg-white text-[#7a8b60]">
                <Leaf size={18} strokeWidth={1.8} />
              </span>
              <span
                className="text-lg font-bold tracking-wide text-[#302935]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {settings?.shopName || 'Fleur de Lune'}
              </span>
            </a>

            <div className="hidden items-center gap-7 md:flex">
              {[
                ['Sản phẩm', '#collection'],
                ['Dịp tặng', '#occasions'],
                ['Dịch vụ', '#atelier'],
              ].map(([item, href]) => (
                <a
                  key={item}
                  href={href}
                  className="text-[11px] font-semibold uppercase tracking-[2px] text-[#302935]/58 transition-colors hover:text-[#7a8b60]"
                >
                  {item}
                </a>
              ))}
            </div>

            {heroBouquet && (
              <button
                onClick={() => handleSelect(heroBouquet)}
                className="inline-flex items-center gap-2 rounded-md bg-[#302935] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Send size={15} />
                Đặt hoa
              </button>
            )}
          </nav>
        </header>

        <main className="relative z-10">
          {/* Hero Section */}
          <section
            id="top"
            className="relative mx-auto grid min-h-[92svh] max-w-7xl items-center gap-10 px-5 pb-14 pt-28 md:grid-cols-[0.88fr_1.12fr] lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pt-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 24 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#ded2c1] bg-white/82 px-3 py-2 text-[11px] font-semibold uppercase tracking-[2px] text-[#7a8b60]">
                <Sparkles size={14} />
                Modern flower boutique
              </div>

              <h1
                className="text-5xl font-bold leading-[0.98] text-[#302935] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {settings?.heroTitle || 'Fleur de Lune'}
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-[#5f5863]">
                {settings?.heroSubtitle || 'Bó hoa pastel hiện đại, gói đẹp, dễ đặt qua Facebook hoặc Instagram. Chọn mẫu, xem chi tiết và inbox shop để chốt hoa nhanh.'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#collection"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7a8b60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  Xem bó hoa
                  <ArrowRight size={16} />
                </a>
                {heroBouquet && (
                  <button
                    onClick={() => handleSelect(heroBouquet)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ded2c1] bg-white px-5 py-3 text-sm font-semibold text-[#302935] transition-colors hover:border-[#7a8b60]"
                  >
                    <Heart size={16} />
                    Mẫu bán chạy
                  </button>
                )}
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-y border-[#e8decf] py-5">
                {[
                  [`${activeProducts.length.toString().padStart(2, '0')}`, 'mẫu hoa thiết kế'],
                  ['2h', 'giao nhanh nội thành'],
                  ['Free', 'thiệp và tag viết tay'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p
                      className="text-2xl font-bold text-[#302935]"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-[#6f6870]">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Dynamic Hero Bouquet Carousel */}
            {activeBouquet && (
              <HeroBouquetStage
                activeBouquet={activeBouquet}
                bouquets={heroStack}
                pointer={pointer}
                onHover={handleHover}
                onSelect={handleSelect}
                loaded={loaded}
              />
            )}
          </section>

          {/* Collection & Filter Section */}
          <section
            id="collection"
            className="scroll-mt-24 border-y border-[#e8decf] bg-[#fffaf6]/94 py-16 lg:py-20"
          >
            <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.32fr_0.68fr] lg:px-8">
              {/* Left Panel: Description & Advanced Filters */}
              <div className="lg:sticky lg:top-28 lg:self-start space-y-8">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#7a8b60]">
                    Sản phẩm nổi bật
                  </p>
                  <h2
                    className="mt-3 text-4xl font-bold leading-tight text-[#302935]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Chọn bó hoa hợp gu của bạn.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#665f69]">
                    Mỗi mẫu có hình ảnh thực tế, loại hoa, dịp tặng và ghi chú để bạn dễ dàng lựa chọn.
                  </p>
                </div>

                {/* Filters container */}
                <div className="rounded-xl border border-[#eadfd3] bg-white p-5 space-y-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a3745] flex items-center gap-1.5 pb-2 border-b border-[#f3ebdf]">
                    <Search size={14} /> Bộ lọc tìm kiếm
                  </h3>

                  {/* Text Search */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a6b67] mb-2">Tìm kiếm từ khóa</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm tên hoa, loại hoa, dịp tặng..."
                        className="w-full rounded-md border border-[#ded2c1] bg-[#faf8f5] pl-9 pr-3 py-2 text-xs text-[#302935] focus:border-[#7a8b60] focus:outline-none"
                      />
                      <Search size={14} className="absolute left-3 top-2.5 text-[#7a6b67]/60" />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a6b67] mb-2">Phân loại hoa</label>
                    <div className="flex flex-wrap gap-1.5">
                      {categoriesList.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`rounded px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                            selectedCategory === cat
                              ? 'bg-[#302935] text-white'
                              : 'bg-[#faf3ec] text-[#7a6b67] hover:bg-[#f3e7db]'
                          }`}
                        >
                          {cat === 'all' ? 'Tất cả' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occasion Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a6b67] mb-2">Chọn theo dịp tặng</label>
                    <div className="flex flex-wrap gap-1.5">
                      {occasionsList.map((occ) => (
                        <button
                          key={occ}
                          onClick={() => setSelectedOccasion(occ)}
                          className={`rounded px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                            selectedOccasion === occ
                              ? 'bg-[#b7797a] text-white'
                              : 'bg-[#fff5f6] text-[#b7797a] hover:bg-[#ffe3e5]'
                          }`}
                        >
                          {occ === 'all' ? 'Tất cả dịp' : occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a6b67] mb-2">Mức giá</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        ['all', 'Tất cả mức giá'],
                        ['under400', 'Dưới 400.000₫'],
                        ['400to600', '400k - 600.000₫'],
                        ['over600', 'Trên 600.000₫'],
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setPriceFilter(key as any)}
                          className={`rounded py-1.5 text-[10px] font-bold text-center transition-all ${
                            priceFilter === key
                              ? 'bg-[#7a8b60] text-white'
                              : 'bg-[#f0f4eb] text-[#7a8b60] hover:bg-[#e2eadd]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Filters button */}
                  {(searchQuery || selectedCategory !== 'all' || selectedOccasion !== 'all' || priceFilter !== 'all') && (
                    <button
                      onClick={handleResetFilters}
                      className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-[#b7797a] hover:underline"
                    >
                      <X size={12} /> Đặt lại tất cả bộ lọc
                    </button>
                  )}
                </div>

                {/* Service highlights */}
                <div className="hidden lg:block space-y-4">
                  {serviceNotes.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eef4e6] text-[#7a8b60]">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#302935]">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#665f69]">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Products Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-[#7a6b67] font-semibold border-b border-[#e8decf] pb-3">
                  <span>Hiển thị {filteredProducts.length} bó hoa phù hợp</span>
                  {(searchQuery || selectedCategory !== 'all' || selectedOccasion !== 'all' || priceFilter !== 'all') && (
                    <span className="text-[#7a8b60]">Đang lọc kết quả</span>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#eadfd3] bg-white/70 p-12 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf0f2] text-[#b7797a] mb-3">
                      <Leaf size={24} />
                    </span>
                    <p className="font-bold text-[#302935]">Không tìm thấy bó hoa phù hợp!</p>
                    <p className="mt-1.5 text-xs text-[#7a6b67] max-w-sm mx-auto">
                      Bạn có thể thử tìm kiếm từ khóa khác, đặt lại bộ lọc hoặc inbox shop để nhận tư vấn thiết kế mẫu riêng nhé.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#302935] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid gap-5 md:grid-cols-2">
                      {paginatedProducts.map((bouquet, index) => (
                        <FlowerProductCard
                          key={bouquet.id}
                          bouquet={bouquet}
                          index={index}
                          isActive={activeBouquet?.id === bouquet.id}
                          onHover={handleHover}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 border-t border-[#e8decf] pt-6">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#eadfd3] bg-white text-[#4a3745] transition-all hover:border-[#b7797a] hover:text-[#b7797a] hover:bg-[#fff5f6] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#eadfd3] disabled:hover:text-[#4a3745]"
                          style={{ cursor: currentPage === 1 ? 'default' : 'none' }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold transition-all ${
                              currentPage === page
                                ? 'bg-[#302935] text-white'
                                : 'border border-[#eadfd3] bg-white text-[#4a3745] hover:border-[#b7797a] hover:text-[#b7797a] hover:bg-[#fff5f6]'
                            }`}
                            style={{ cursor: 'none' }}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#eadfd3] bg-white text-[#4a3745] transition-all hover:border-[#b7797a] hover:text-[#b7797a] hover:bg-[#fff5f6] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#eadfd3] disabled:hover:text-[#4a3745]"
                          style={{ cursor: currentPage === totalPages ? 'default' : 'none' }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Dịp Tặng Section */}
          <section
            id="occasions"
            className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20"
          >
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#b7797a]">
                  Chọn theo dịp
                </p>
                <h2
                  className="mt-3 text-4xl font-bold leading-tight text-[#302935]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Gợi ý nhanh cho khách đang cần đặt hoa gấp.
                </h2>
                <p className="mt-5 text-sm leading-7 text-[#665f69]">
                  Lựa chọn nhanh theo các nhóm dịp ý nghĩa giúp bạn tìm ra bó hoa thể hiện tình cảm trọn vẹn nhất.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {occasionShowcase.map(({ icon: Icon, title, text }, index) => {
                  // Find a product that has this occasion to set hover reference
                  const relatedProduct = activeProducts.find(p => p.occasion.includes(title)) || null;

                  return (
                    <motion.button
                      key={title}
                      onClick={() => handleOccasionSelect(title)}
                      onPointerEnter={() => handleHover(relatedProduct)}
                      onPointerLeave={() => handleHover(null)}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ delay: index * 0.05, duration: 0.45 }}
                      className="group min-h-32 rounded-lg border border-[#e2d8ca] bg-white/78 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#b7797a] hover:bg-white"
                    >
                      <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#fff2f3] text-[#b7797a] group-hover:bg-[#eef4e6] group-hover:text-[#7a8b60]">
                        <Icon size={16} />
                      </span>
                      <span
                        className="block text-xl font-bold leading-tight text-[#302935]"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {title}
                      </span>
                      <span className="mt-3 block text-xs leading-5 text-[#665f69]">{text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Atelier Section */}
          <section id="atelier" className="border-t border-[#e8decf] bg-[#fffaf6]/72">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#7a8b60]">
                  Dịch vụ shop hoa
                </p>
                <h2
                  className="mt-3 text-3xl font-bold leading-tight text-[#302935]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Đẹp tự nhiên trên ảnh, giao tận nơi an toàn.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Feather', 'Thiết kế tone hoa', 'Tất cả ruy băng, giấy gói cao cấp và thiệp nhỏ đi kèm được thiết kế riêng.'],
                  ['Send', 'Inbox đặt dễ dàng', 'Gửi hình mẫu qua Zalo/FB Messenger, tiệm sẽ chốt đơn nhanh trong 5 phút.'],
                  ['Leaf', 'Xử lý tươi sạch', 'Hoa được sơ chế kỹ lưỡng, cấp nước đầy đủ để tươi lâu khi tới tay.'],
                ].map(([kind, title, text]) => {
                  const Icon = kind === 'Feather' ? Feather : kind === 'Send' ? Send : Leaf;
                  return (
                    <div key={kind} className="rounded-lg border border-[#e2d8ca] bg-white/80 p-4 shadow-sm">
                      <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#eef4e6] text-[#7a8b60]">
                        <Icon size={16} />
                      </span>
                      <p className="text-sm font-bold text-[#302935]">{title}</p>
                      <p className="mt-2 text-xs leading-5 text-[#665f69]">{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        {/* Dynamic Footer */}
        <footer className="border-t border-[#e8decf] bg-[#302935] text-white py-12 px-5 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand block */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded bg-white/10 text-[#f5b9cb]">
                  <Leaf size={16} />
                </span>
                <span className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {settings?.shopName || 'Fleur de Lune'}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-6">
                Tiệm hoa tươi pastel phong cách hiện đại. Mang đến sự ngọt ngào, tinh tế qua từng bó hoa được gói tỉ mỉ bằng tình yêu.
              </p>
            </div>

            {/* Quick settings contact info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5b9cb]">Liên hệ cửa hàng</h4>
              <ul className="space-y-2 text-xs text-white/70">
                {settings?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-[#f5b9cb]" /> Hotline: {settings.phone}
                  </li>
                )}
                {settings?.address && (
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 text-[#f5b9cb] shrink-0" />
                    <span>Địa chỉ: {settings.address}</span>
                  </li>
                )}
                {settings?.openingHours && (
                  <li className="flex items-center gap-2">
                    <Clock size={14} className="text-[#f5b9cb]" /> Mở cửa: {settings.openingHours}
                  </li>
                )}
              </ul>
            </div>

            {/* Connect Channels */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5b9cb]">Kênh Đặt Hoa Hỗ Trợ</h4>
              <div className="flex flex-wrap gap-2">
                {settings?.zaloLink && (
                  <a
                    href={settings.zaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white hover:bg-[#2572e6] transition-colors"
                    title="Zalo"
                  >
                    <MessageSquare size={16} />
                  </a>
                )}
                {settings?.messengerLink && (
                  <a
                    href={settings.messengerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white hover:bg-[#803ef0] transition-colors"
                    title="Messenger"
                  >
                    <MessageCircle size={16} />
                  </a>
                )}
                {settings?.instagramLink && (
                  <a
                    href={settings.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white hover:bg-[#e1306c] transition-colors"
                    title="Instagram"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Admin Portal Gateway */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5b9cb]">Quản trị tiệm hoa</h4>
              <p className="text-xs text-white/50 leading-5">
                Chủ shop có thể quản lý sản phẩm hoa, banner hình ảnh và thông tin của shop bằng liên kết dưới đây.
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
                style={{ cursor: 'none' }}
              >
                <Unlock size={13} /> Trang quản trị Admin
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-7xl mt-10 pt-6 border-t border-white/10 text-center text-[10px] text-white/40">
            <p>© {new Date().getFullYear()} {settings?.shopName || 'Fleur de Lune'}. Bảo lưu mọi quyền.</p>
          </div>
        </footer>
      </div>

      {settings && (
        <BouquetDetail bouquet={selectedBouquet} onClose={handleClose} settings={settings} />
      )}
    </>
  );
}

// ─── HERO BOUQUET STAGE ───────────────────────────────────────────────────────
interface HeroBouquetStageProps {
  activeBouquet: Bouquet;
  bouquets: Bouquet[];
  pointer: PointerState;
  loaded: boolean;
  onHover: (bouquet: Bouquet | null) => void;
  onSelect: (bouquet: Bouquet) => void;
}

function HeroBouquetStage({
  activeBouquet,
  bouquets: heroBouquets,
  pointer,
  loaded,
  onHover,
  onSelect,
}: HeroBouquetStageProps) {
  const mainOffset = getHeroOffset(pointer, -10);
  const detailOffset = getHeroOffset(pointer, 7);

  if (heroBouquets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.98 }}
      transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[470px] sm:min-h-[560px] lg:min-h-[650px]"
    >
      <div className="absolute inset-x-10 bottom-10 top-16 rotate-[-3deg] rounded-lg border border-[#ded2c1] bg-[#f4efe7]/80" />
      <div className="absolute inset-x-3 bottom-2 top-8 rotate-[2deg] rounded-lg border border-[#e4d9ca] bg-[#f8fbf2]/86" />

      <motion.button
        data-bouquet-anchor={activeBouquet.id}
        onPointerEnter={() => onHover(activeBouquet)}
        onPointerLeave={() => onHover(null)}
        onClick={() => onSelect(activeBouquet)}
        className="absolute left-1/2 top-1/2 z-10 aspect-[0.78] w-[min(76vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white bg-white text-left shadow-[0_22px_58px_rgba(54,42,45,0.14)]"
        style={{
          x: mainOffset.x,
          y: mainOffset.y,
        }}
        animate={{ y: [mainOffset.y, mainOffset.y - 5, mainOffset.y] }}
        whileHover={{ scale: 1.012 }}
        whileTap={{ scale: 0.99 }}
        transition={{
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.35 },
        }}
      >
        <img src={activeBouquet.image} alt={activeBouquet.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#302935]/74 via-[#302935]/6 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/74">
            {activeBouquet.category}
          </p>
          <h2
            className="mt-2 text-4xl font-bold"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {activeBouquet.name}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-5 text-white/84">{activeBouquet.style}</p>
          <p className="mt-3 text-lg font-bold text-white">{formatPrice(activeBouquet.price)}</p>
        </div>
      </motion.button>

      {heroBouquets.map((bouquet, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const y = index < 2 ? 12 + index * 122 : 320 + (index - 2) * 72;
        const x = side < 0 ? 1 : 67;

        return (
          <motion.button
            key={bouquet.id}
            data-bouquet-anchor={bouquet.id}
            onPointerEnter={() => onHover(bouquet)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onSelect(bouquet)}
            className="absolute z-20 hidden w-32 overflow-hidden rounded-lg border border-white bg-white/96 shadow-lg backdrop-blur-sm sm:block"
            style={{
              left: `${x}%`,
              top: y,
              x: detailOffset.x * (index + 1) * 0.25,
              y: detailOffset.y * (index + 1) * 0.25,
              rotate: side * (3 + index),
            }}
            whileHover={{ y: -7, rotate: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          >
            <img src={bouquet.image} alt={bouquet.name} className="h-36 w-full object-cover" />
            <span className="block truncate px-3 pt-2 text-left text-[11px] font-bold text-[#302935]">
              {bouquet.name}
            </span>
            <span className="block truncate px-3 pb-2 text-left text-[9px] font-semibold uppercase tracking-[1px] text-[#b7797a]">
              {formatPrice(bouquet.price)}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// ─── FLOWER PRODUCT CARD ──────────────────────────────────────────────────────
interface FlowerProductCardProps {
  bouquet: Bouquet;
  index: number;
  isActive: boolean;
  onHover: (bouquet: Bouquet | null) => void;
  onSelect: (bouquet: Bouquet) => void;
}

function FlowerProductCard({
  bouquet,
  index,
  isActive,
  onHover,
  onSelect,
}: FlowerProductCardProps) {
  const [tilt, setTilt] = useState<TiltState>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef<number>(0);
  const latestPointerRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleMove = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    latestPointerRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };

    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      const latest = latestPointerRef.current;
      setTilt({
        x: latest.x - 0.5,
        y: latest.y - 0.5,
      });
      frameRef.current = 0;
    });
  };

  const handleEnter = () => {
    setIsHovered(true);
    onHover(bouquet);
  };

  const handleLeave = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    onHover(null);
  };

  return (
    <motion.article
      data-bouquet-anchor={bouquet.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.045, duration: 0.5 }}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-xl"
      style={{
        borderColor: isActive ? bouquet.color : '#eadfd3',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: bouquet.glowColor }}
      />

      <div className="relative aspect-[1.08] overflow-hidden bg-[#f7f1eb]">
        <img
          src={bouquet.image}
          alt={bouquet.name}
          className="h-full w-full object-cover transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${tilt.x * -8}px, ${tilt.y * -8}px, 0) scale(${isActive ? 1.055 : 1.02}) rotate(${tilt.x * 1.2}deg)`,
            willChange: isHovered ? 'transform' : 'auto',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/88 via-white/8 to-transparent" />

        {isHovered &&
          [0, 1, 2].map((petal) => (
            <motion.span
              key={petal}
              className="pointer-events-none absolute h-4 w-2 rounded-[80%_20%_70%_30%]"
              style={{
                left: `${28 + petal * 18}%`,
                top: `${26 + (petal % 2) * 34}%`,
                background: petal % 2 ? '#fff4f4' : bouquet.color,
                opacity: 0.58,
              }}
              initial={{ y: 10, opacity: 0, rotate: petal * 20 }}
              animate={{ y: [-2, -20, -30], opacity: [0, 0.58, 0], rotate: petal * 32 + 70 }}
              transition={{ duration: 2.1 + petal * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
      </div>

      <div className="relative p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#b7797a]">
            {bouquet.category}
          </p>
          <p className="text-base font-extrabold text-[#302935]">{formatPrice(bouquet.price)}</p>
        </div>

        <h3
          className="text-2xl font-bold text-[#302935]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {bouquet.name}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[#7a8b60]">{bouquet.style}</p>
        <p className="mt-2 text-sm leading-6 text-[#655e66]">{bouquet.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {bouquet.flowerTypes.slice(0, 3).map((flower) => (
            <span
              key={flower}
              className="rounded-md bg-[#f8f3ec] px-2 py-1 text-[10px] font-bold uppercase tracking-[1px] text-[#7a6b67]"
            >
              {flower}
            </span>
          ))}
        </div>

        <button
          onClick={() => onSelect(bouquet)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#302935] px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Send size={16} />
          Xem chi tiết & đặt hoa
        </button>
      </div>
    </motion.article>
  );
}

// ─── ROUTER & MAIN ENTRY ──────────────────────────────────────────────────────
function MainRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Set cursor based on route
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.style.cursor = 'auto';
    } else {
      document.documentElement.style.cursor = 'none';
    }
  }, [isAdmin]);

  return (
    <Routes>
      <Route path="/" element={<CustomerPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <MainRoutes />
    </HashRouter>
  );
}
