// Global state: auth from backend, cart/wishlist synced with backend when logged in.
import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import { authApi, cartApi, wishlistApi } from "./api";

export type Role = "customer" | "vendor" | "admin";

export interface AppUser {
  _id: string; name: string; email: string; role: Role;
  phone?: string; avatarUrl?: string;
}
export interface VendorProfile {
  _id: string; storeName: string; slug: string; tagline: string;
  approvalStatus: string; logoUrl: string; [k: string]: any;
}
export interface CartItem {
  product: any; qty: number; size?: string; color?: string;
}

interface StoreContextValue {
  user: AppUser | null;
  vendorProfile: VendorProfile | null;
  cart: CartItem[];
  wishlist: any[];
  wishlistIds: string[];
  theme: "light" | "dark";
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: AppUser; vendorProfile?: VendorProfile }>;
  signOut: () => Promise<void>;
  setUserData: (u: AppUser, vp?: VendorProfile | null) => void;
  addToCart: (productId: string, qty?: number, opts?: { size?: string; color?: string }) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  toggleTheme: () => void;
  cartTotal: number;
  cartCount: number;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => read("mk_theme", "light"));
  const [loading, setLoading] = useState(true);

  // On mount: try to restore session from cookie
  useEffect(() => {
    authApi.getMe()
      .then((data: any) => {
        setUser(data.user);
        setVendorProfile(data.vendorProfile || null);
        // Load cart & wishlist from backend
        return Promise.all([cartApi.get(), wishlistApi.get()]);
      })
      .then(([cartData, wlData]: any) => {
        setCart(cartData.cart || []);
        setWishlist(wlData.wishlist || []);
      })
      .catch(() => { /* not logged in */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("mk_theme", JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setUserData = useCallback((u: AppUser, vp?: VendorProfile | null) => {
    setUser(u);
    setVendorProfile(vp || null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data: any = await authApi.login({ email, password });
    setUser(data.user);
    setVendorProfile(data.vendorProfile || null);
    // Fetch cart & wishlist
    try {
      const [c, w]: any = await Promise.all([cartApi.get(), wishlistApi.get()]);
      setCart(c.cart || []);
      setWishlist(w.wishlist || []);
    } catch { /* ignore */ }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.logout();
    setUser(null); setVendorProfile(null); setCart([]); setWishlist([]);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    try { const d: any = await cartApi.get(); setCart(d.cart || []); } catch { /* */ }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) return;
    try { const d: any = await wishlistApi.get(); setWishlist(d.wishlist || []); } catch { /* */ }
  }, [user]);

  const addToCart = useCallback(async (productId: string, qty = 1, opts?: { size?: string; color?: string }) => {
    if (!user) return;
    const d: any = await cartApi.add(productId, qty, opts?.size || '', opts?.color || '');
    setCart(d.cart || []);
  }, [user]);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    if (!user) return;
    const d: any = await cartApi.update(productId, qty);
    setCart(d.cart || []);
  }, [user]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;
    const d: any = await cartApi.remove(productId);
    setCart(d.cart || []);
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await cartApi.clear();
    setCart([]);
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    const d: any = await wishlistApi.toggle(productId);
    setWishlist(d.wishlist || []);
  }, [user]);

  const value = useMemo<StoreContextValue>(() => {
    const cartTotal = cart.reduce((s, c) => s + (c.product?.price || 0) * c.qty, 0);
    const cartCount = cart.reduce((s, c) => s + c.qty, 0);
    const wishlistIds = wishlist.map((w: any) => w._id || w);
    return {
      user, vendorProfile, cart, wishlist, wishlistIds, theme, loading,
      signIn, signOut, setUserData,
      addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, refreshCart, refreshWishlist,
      toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light"),
      cartTotal, cartCount,
    };
  }, [user, vendorProfile, cart, wishlist, theme, loading, signIn, signOut, setUserData, addToCart, updateQty, removeFromCart, clearCart, toggleWishlist, refreshCart, refreshWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
