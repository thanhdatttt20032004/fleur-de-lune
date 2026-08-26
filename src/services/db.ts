import type { Bouquet, ShopSettings } from '../types';

const PRODUCTS_KEY = 'fleur_products';
const SETTINGS_KEY = 'fleur_settings';

const PASTEL_PALETTES = [
  { color: '#ffb3c1', glow: 'radial-gradient(circle, rgba(251,196,212,0.34) 0%, transparent 68%)' }, // Rosy Blush
  { color: '#fbc4d4', glow: 'radial-gradient(circle, rgba(251,196,212,0.32) 0%, transparent 68%)' }, // Peony Sweetheart
  { color: '#ffecd2', glow: 'radial-gradient(circle, rgba(255,236,210,0.42) 0%, transparent 68%)' }, // Peach Tulip
  { color: '#ffe57f', glow: 'radial-gradient(circle, rgba(255,229,127,0.32) 0%, transparent 68%)' }, // Sunny Daisy
  { color: '#ffd6e0', glow: 'radial-gradient(circle, rgba(255,214,224,0.36) 0%, transparent 68%)' }, // Pink Cloud
  { color: '#dcd0ff', glow: 'radial-gradient(circle, rgba(220,208,255,0.38) 0%, transparent 68%)' }, // Lavender Dream
  { color: '#b3e5fc', glow: 'radial-gradient(circle, rgba(179,229,252,0.34) 0%, transparent 68%)' }, // Celestial Beauty (Blue)
  { color: '#ffe0b2', glow: 'radial-gradient(circle, rgba(255,224,178,0.38) 0%, transparent 68%)' }, // Sunset Glow (Orange)
  { color: '#f5f5f5', glow: 'radial-gradient(circle, rgba(245,245,245,0.42) 0%, transparent 68%)' }, // Peony Glow (White)
];

// Seed data
const defaultBouquets = [
  {
    id: 'rosy-blush',
    name: 'Rosy Blush',
    price: 450000,
    image: '/images/bouquet_rose_cute.png',
    category: 'Best seller',
    description: 'Tone hồng phấn nhẹ, hợp để tặng sinh nhật, kỷ niệm nhỏ hoặc một lời chúc dễ thương.',
    flowerTypes: ['Hoa hồng kem', 'Hoa hồng phấn', 'Baby trắng', 'Lá bạc'],
    occasion: ['Sinh nhật', 'Kỷ niệm nhỏ', 'Tặng bạn gái', 'Quà bất ngờ'],
    hoverMessage: 'Bó này đang được yêu thích 🌸 Tone màu rất nhẹ nhàng.',
    isActive: true,
  },
  {
    id: 'peony-sweetheart',
    name: 'Peony Sweetheart',
    price: 680000,
    image: '/images/bouquet_peony_pastel.png',
    category: 'Premium bouquet',
    description: 'Bó hoa lớn hơn, nhiều lớp cánh mềm, phù hợp khi bạn muốn món quà trông nổi bật và cao cấp.',
    flowerTypes: ['Mẫu đơn hồng', 'Hồng kem', 'Cẩm chướng', 'Lá eucalyptus'],
    occasion: ['Sinh nhật người yêu', 'Kỷ niệm', 'Ngày của Mẹ', 'Chúc mừng'],
    hoverMessage: 'Mẫu này nhìn rất sang và hợp cho dịp đặc biệt ✨',
    isActive: true,
  },
  {
    id: 'peach-tulip',
    name: 'Peach Tulip',
    price: 390000,
    image: '/images/bouquet_tulip_cream.png',
    category: 'Korean style',
    description: 'Kiểu bó gọn, màu sáng và tự nhiên, hợp với khách thích phong cách Hàn Quốc nhẹ nhàng.',
    flowerTypes: ['Tulip đào', 'Tulip kem', 'Hoa nhí trắng', 'Giấy kraft'],
    occasion: ['Cảm ơn', 'Xin lỗi', 'Động viên', 'Tặng bạn thân'],
    hoverMessage: 'Tone kem đào rất tự nhiên và tối giản 🌷',
    isActive: true,
  },
  {
    id: 'sunny-daisy',
    name: 'Sunny Daisy',
    price: 320000,
    image: '/images/bouquet_daisy_sunny.png',
    category: 'Daily flowers',
    description: 'Màu trắng vàng trong trẻo, hợp làm món quà nhẹ nhàng cho bạn bè, đồng nghiệp hoặc người thân.',
    flowerTypes: ['Cúc họa mi', 'Hoa nhí vàng', 'Lá xanh', 'Giấy kem'],
    occasion: ['Bạn thân', 'Đồng nghiệp', 'Cảm ơn', 'Cổ vũ tinh thần'],
    hoverMessage: 'Mẫu này rất tươi sáng, giá mềm dễ tặng ☀️',
    isActive: true,
  },
  {
    id: 'pink-cloud',
    name: 'Pink Cloud',
    price: 350000,
    image: '/images/bouquet_baby_pink.png',
    category: 'Photo bouquet',
    description: 'Hoa baby hồng nhẹ, form lớn và mềm, rất hợp chụp ảnh, kỷ niệm hoặc decor góc phòng.',
    flowerTypes: ['Baby hồng', 'Baby trắng', 'Giấy lụa pastel', 'Ruy băng'],
    occasion: ['Chụp ảnh', 'Kỷ niệm', 'Tặng bạn gái', 'Decor phòng'],
    hoverMessage: 'Form hoa bồng bềnh bồng như mây hồng ☁️',
    isActive: true,
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    price: 420000,
    image: '/images/bouquet_lavender_mist.png',
    category: 'Korean style',
    description: 'Sắc tím oải hương mộng mơ kết hợp hồng tím pastel, mang cảm giác yên bình, nhẹ nhàng và thư giãn.',
    flowerTypes: ['Hoa oải hương', 'Hồng tím pastel', 'Baby trắng', 'Lá bạc'],
    occasion: ['Sinh nhật', 'Kỷ niệm', 'Tặng bạn thân', 'Chúc sức khỏe'],
    hoverMessage: 'Hương oải hương dịu nhẹ xua tan mệt mỏi nhé 💜',
    isActive: true,
  },
  {
    id: 'celestial-beauty',
    name: 'Celestial Beauty',
    price: 750000,
    image: '/images/bouquet_celestial.png',
    category: 'Premium bouquet',
    description: 'Bó hoa với tone màu xanh đêm kỳ diệu pha ánh bạc lấp lánh, mang cảm giác thần tiên kỳ ảo.',
    flowerTypes: ['Cẩm tú cầu xanh', 'Hoa hồng trắng', 'Lá bạc', 'Giấy gói navy'],
    occasion: ['Sinh nhật', 'Kỷ niệm', 'Chúc mừng', 'Chụp ảnh'],
    hoverMessage: 'Tone xanh huyền bí mang lại cảm giác cực kỳ khác biệt 🌌',
    isActive: true,
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    price: 480000,
    image: '/images/bouquet_sunset.png',
    category: 'Best seller',
    description: 'Sự kết hợp ấm áp giữa hoa tulip cam, marigold và hồng cam như ánh hoàng hôn dịu ngọt.',
    flowerTypes: ['Tulip cam', 'Marigold', 'Hồng cam lửa', 'Lá eucalyptus'],
    occasion: ['Sinh nhật', 'Cảm ơn', 'Động viên', 'Hoa hằng ngày'],
    hoverMessage: 'Ấm áp như ánh hoàng hôn cuối chiều 🧡',
    isActive: true,
  },
  {
    id: 'peony-glow',
    name: 'Peony Glow',
    price: 720000,
    image: '/images/bouquet_peony_glow.png',
    category: 'Premium bouquet',
    description: 'Mẫu đơn trắng sữa thanh tao phát sáng dịu dàng, tạo nên vẻ đẹp thuần khiết, quý phái.',
    flowerTypes: ['Mẫu đơn trắng', 'Hồng kem dâu', 'Baby trắng', 'Lá eucalyptus'],
    occasion: ['Kỷ niệm', 'Ngày của Mẹ', 'Chúc mừng', 'Sinh nhật người yêu'],
    hoverMessage: 'Mẫu đơn trắng biểu tượng của sự thuần khiết và quý phái ✨',
    isActive: true,
  },
];

const defaultSettings: ShopSettings = {
  shopName: 'Fleur de Lune',
  logo: '',
  phone: '090 123 4567',
  zaloLink: 'https://zalo.me/0901234567',
  messengerLink: 'https://m.me/fleurdelune',
  instagramLink: 'https://instagram.com/fleurdelune',
  address: '12 Quốc Hương, Thảo Điền, Quận 2, TP. Hồ Chí Minh',
  openingHours: '08:00 - 21:00 hằng ngày',
  heroTitle: 'Fleur de Lune',
  heroSubtitle: 'Bó hoa pastel hiện đại, gói đẹp, dễ đặt qua Facebook hoặc Instagram. Chọn mẫu, xem chi tiết và inbox shop để chốt hoa nhanh.',
  heroImage: '/images/bouquet_peony_pastel.png',
};

// Formatter helper
export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + '₫';
}

// Auto-complete visual attributes for compatibility
export function completeBouquet(product: Partial<Bouquet> & { id: string }, index: number = 0): Bouquet {
  const palette = PASTEL_PALETTES[index % PASTEL_PALETTES.length];
  
  const completed: Bouquet = {
    id: product.id,
    name: product.name || 'Bó Hoa Mới',
    price: product.price || 0,
    description: product.description || '',
    image: product.image || '/images/bouquet_rose_cute.png',
    category: product.category || 'Mới',
    occasion: product.occasion || [],
    flowerTypes: product.flowerTypes || [],
    hoverMessage: product.hoverMessage || 'Bó hoa tươi xinh xắn.',
    isActive: product.isActive !== undefined ? product.isActive : true,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),

    // Legacy fields mapped
    tags: product.tags || [product.category || 'Mới', ...(product.flowerTypes || []).slice(0, 2)],
    orbitAngle: product.orbitAngle !== undefined ? product.orbitAngle : (index * 72) % 360,
    color: product.color || palette.color,
    glowColor: product.glowColor || palette.glow,
    style: product.style || `Bó hoa ${product.category?.toLowerCase() || 'mới'}`,
    productNote: product.productNote || 'Form bó xinh xắn, dễ chụp ảnh và phù hợp đặt giao trong ngày.',
    hoverDialogues: product.hoverDialogues || [product.hoverMessage || 'Bó hoa tươi xinh xắn.'],
    detail: product.detail || {
      meaning: product.description || '',
      vibe: `${product.category} • Xinh xắn`,
      occasions: product.occasion || [],
      careNote: 'Giữ hoa nơi mát, tránh nắng trực tiếp và thay nước mỗi ngày nếu cắm bình.',
      butterflyDescription: product.hoverMessage || 'Bó hoa tươi xinh xắn.',
    },
  };

  return completed;
}

// DB API
export const db = {
  getProducts(): Bouquet[] {
    const dataStr = localStorage.getItem(PRODUCTS_KEY);
    if (!dataStr) {
      // Seed initial data
      const initialProducts = defaultBouquets.map((b, idx) => completeBouquet(b as any, idx));
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    try {
      const list = JSON.parse(dataStr) as any[];
      let mapped = list.map((item, idx) => completeBouquet(item, idx));
      
      // Auto-migration: if any default bouquet doesn't exist yet in user's localStorage, seed it
      let changed = false;
      defaultBouquets.forEach((defaultBouquet) => {
        if (!mapped.some((p) => p.id === defaultBouquet.id)) {
          const completed = completeBouquet(defaultBouquet as any, mapped.length);
          mapped.push(completed);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mapped));
      }
      return mapped;
    } catch (e) {
      console.error('Failed to parse products', e);
      return [];
    }
  },

  saveProducts(products: Bouquet[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  getSettings(): ShopSettings {
    const dataStr = localStorage.getItem(SETTINGS_KEY);
    if (!dataStr) {
      // Seed default settings
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    try {
      return { ...defaultSettings, ...JSON.parse(dataStr) };
    } catch (e) {
      console.error('Failed to parse settings', e);
      return defaultSettings;
    }
  },

  saveSettings(settings: ShopSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
