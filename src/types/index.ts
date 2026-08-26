export interface Bouquet {
  id: string;
  name: string;
  price: number; // Changed from string to number for dynamic pricing
  description: string;
  image: string; // Base64 string or image path
  category: string;
  occasion: string[]; // Occasions list
  flowerTypes: string[];
  hoverMessage: string; // Hover message for the butterfly
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Legacy/Visual properties for compatibility with existing UI & animation code
  tags: string[];
  orbitAngle: number;
  color: string;
  glowColor: string;
  style: string;
  productNote: string;
  hoverDialogues: string[];
  detail: {
    meaning: string;
    vibe: string;
    occasions: string[];
    careNote: string;
    butterflyDescription: string;
  };
}

export interface ShopSettings {
  shopName: string;
  logo: string;
  phone: string;
  zaloLink: string;
  messengerLink: string;
  instagramLink: string;
  address: string;
  openingHours: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
}

