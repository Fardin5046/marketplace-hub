// Types and helpers. Data now comes from the backend.
export type Role = "customer" | "vendor" | "admin";

export interface Vendor {
  _id: string; name?: string; storeName?: string; slug: string; tagline: string;
  rating?: number; ratingAverage?: number; ratingCount?: number; reviewCount?: number;
  logo?: string; logoUrl?: string; banner?: string; bannerUrl?: string;
  joined?: string; productCount?: number;
  status?: string; approvalStatus?: string;
  user?: any;
}

export interface Product {
  _id: string; slug: string; title: string; vendor?: any; vendorId?: string;
  vendorName: string; vendorSlug?: string;
  category?: any; categorySlug?: string;
  price: number; oldPrice?: number; discountPercent?: number;
  ratingAverage?: number; rating?: number; ratingCount?: number; reviewCount?: number;
  stock: number; images: { url: string; publicId?: string; alt?: string }[];
  badge?: string; discount?: number; sizes?: string[];
  colors?: { name: string; hex: string }[];
  description: string; shortDescription?: string;
  specs?: { label: string; value: string }[];
  tags?: string[]; sku?: string; brand?: string;
  status?: string; isFeatured?: boolean;
}

export type OrderStatus = "Delivered" | "In Transit" | "Processing" | "Cancelled" | "Pending";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Helper to get first image URL from product
export const productImage = (p: any, idx = 0): string => {
  if (!p?.images?.length) return 'https://placehold.co/400x400?text=No+Image';
  const img = p.images[idx] || p.images[0];
  return typeof img === 'string' ? img : img.url || 'https://placehold.co/400x400?text=No+Image';
};
