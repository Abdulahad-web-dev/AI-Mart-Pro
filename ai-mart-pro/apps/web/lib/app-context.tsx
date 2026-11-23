'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, post, patch, del, User, Product } from '@/lib/api';
import { getCompared } from '@/lib/compare';
import { DEMO_PRODUCTS } from '@/lib/demo-products';

/* --------------------------------------------------------------------------
   Guest (signed-out) storage helpers — the cart/wishlist live in localStorage
   until the shopper signs in as a CUSTOMER, then they are merged into the
   real server-side cart & wishlist (POST /api/cart/items, /api/wishlist/:id).
   -------------------------------------------------------------------------- */
export interface CartStoredItem {
  productId: string;
  quantity: number;
  product?: Product;
}

const CART_KEY = 'aimart_cart_items';
const WISH_KEY = 'aimart_wishlist';
const WISH_PRODUCTS_KEY = 'aimart_wishlist_products';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function resolveProduct(id: string, known?: Product): Product | undefined {
  return known || DEMO_PRODUCTS.find((p) => p.id === id || p.slug === id);
}

export function getLocalCartCount(): number {
  const items = readJson<CartStoredItem[]>(CART_KEY, []);
  return Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
}

export function getLocalCartItems(): CartLine[] {
  const stored = readJson<CartStoredItem[]>(CART_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .map((item) => {
      const product = resolveProduct(item.productId, item.product);
      return product ? { product, quantity: item.quantity || 1 } : null;
    })
    .filter(Boolean) as CartLine[];
}

export function getLocalWishlist(): string[] {
  const w = readJson<string[]>(WISH_KEY, []);
  return Array.isArray(w) ? w : [];
}

export function toggleLocalWishlist(id: string, product?: Product): string[] {
  const current = getLocalWishlist();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  writeJson(WISH_KEY, next);
  const map = readJson<Record<string, Product>>(WISH_PRODUCTS_KEY, {});
  if (next.includes(id) && product) map[id] = product;
  if (!next.includes(id)) delete map[id];
  writeJson(WISH_PRODUCTS_KEY, map);
  return next;
}

export function addLocalCart(productId: string, quantity = 1, product?: Product): number {
  const items = readJson<CartStoredItem[]>(CART_KEY, []);
  const idx = items.findIndex((x) => x.productId === productId);
  if (idx >= 0) {
    items[idx].quantity += quantity;
    if (product) items[idx].product = product;
  } else {
    items.push({ productId, quantity, product });
  }
  writeJson(CART_KEY, items);
  return items.reduce((s, i) => s + i.quantity, 0);
}

/* -------------------------------------------------------------------------- */
export type CartLine = { id?: string; product: Product; quantity: number };

type AppContextType = {
  user: User | null;
  ready: boolean;
  toast: string;
  cartCount: number;
  wishlistCount: number;
  compareCount: number;
  cart: CartLine[];
  wishlist: string[];
  wishlistProducts: Product[];
  /** True when the cart/wishlist are backed by the real server API. */
  isServerCart: boolean;
  /** Increments on every successful add-to-cart (drives the cart bump animation). */
  cartPulse: number;
  setToast: (s: string) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  updateCounts: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  addCart?: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, product?: Product) => void;
};

const AppCtx = createContext<AppContextType>({
  user: null,
  ready: false,
  toast: '',
  cartCount: 0,
  wishlistCount: 0,
  compareCount: 0,
  cart: [],
  wishlist: [],
  wishlistProducts: [],
  isServerCart: false,
  cartPulse: 0,
  setToast: () => {},
  refresh: async () => {},
  logout: async () => {},
  updateCounts: () => {},
  refreshCart: async () => {},
  addToCart: () => {},
  addCart: () => {},
  removeFromCart: () => {},
  updateCartQuantity: () => {},
  clearCart: () => {},
  toggleWishlist: () => {}
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [compareCount, setCompareCount] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartPulse, setCartPulse] = useState(0);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const isCustomer = (u: User | null) => u?.role === 'CUSTOMER';

  /* ---------- loaders ---------- */
  const loadLocal = useCallback(() => {
    setCart(getLocalCartItems());
    const ids = getLocalWishlist();
    const map = readJson<Record<string, Product>>(WISH_PRODUCTS_KEY, {});
    setWishlist(ids);
    setWishlistProducts(ids.map((id) => resolveProduct(id, map[id])).filter(Boolean) as Product[]);
  }, []);

  const loadServer = useCallback(async () => {
    const [items, wish] = await Promise.all([
      api<Array<{ id: string; quantity: number; product: Product }>>('/api/cart').catch(() => null),
      api<Product[]>('/api/wishlist').catch(() => null)
    ]);
    if (items) setCart(items.map((i) => ({ id: i.id, product: i.product, quantity: i.quantity })));
    if (wish) {
      setWishlistProducts(wish);
      setWishlist(wish.map((p) => p.id));
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (isCustomer(userRef.current)) await loadServer();
    else loadLocal();
  }, [loadLocal, loadServer]);

  const updateCounts = useCallback(() => {
    setCompareCount(getCompared().length);
    void refreshCart();
  }, [refreshCart]);

  /** Moves a guest cart/wishlist into the signed-in customer's real account. */
  const mergeGuestData = useCallback(async () => {
    const guestCart = readJson<CartStoredItem[]>(CART_KEY, []);
    const guestWish = getLocalWishlist();
    if (!guestCart.length && !guestWish.length) return;
    for (const item of guestCart) {
      try {
        await post('/api/cart/items', { productId: item.productId, quantity: item.quantity });
      } catch {}
    }
    for (const id of guestWish) {
      try {
        await post(`/api/wishlist/${id}`, {});
      } catch {}
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(WISH_KEY);
      localStorage.removeItem(WISH_PRODUCTS_KEY);
    }
  }, []);

  const refresh = useCallback(async () => {
    let me: User | null = null;
    try {
      me = await api<User>('/api/auth/me');
    } catch {
      me = null;
    }
    setUser(me);
    userRef.current = me;
    if (isCustomer(me)) {
      await mergeGuestData();
      await loadServer();
    } else {
      loadLocal();
    }
    setCompareCount(getCompared().length);
    setReady(true);
  }, [loadLocal, loadServer, mergeGuestData]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- cart actions ---------- */
  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      const label = `"${product.name.slice(0, 28)}${product.name.length > 28 ? '…' : ''}"`;
      if (isCustomer(userRef.current)) {
        void post('/api/cart/items', { productId: product.id, quantity })
          .then(async () => {
            await loadServer();
            setCartPulse((n) => n + 1);
            setToast(`Added ${label} to your cart`);
          })
          .catch((e: Error) => setToast(e.message || 'Could not add this item to your cart'));
        return;
      }
      if (product.stock !== undefined && product.stock <= 0) {
        setToast('This product is currently out of stock');
        return;
      }
      addLocalCart(product.id, quantity, product);
      loadLocal();
      setCartPulse((n) => n + 1);
      setToast(`Added ${label} to your cart`);
    },
    [loadLocal, loadServer]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (isCustomer(userRef.current)) {
        const line = cart.find((l) => l.product.id === productId);
        if (!line?.id) return;
        setCart((c) => c.filter((l) => l.product.id !== productId));
        void del(`/api/cart/items/${line.id}`)
          .catch((e: Error) => setToast(e.message))
          .finally(() => void loadServer());
        return;
      }
      const items = readJson<CartStoredItem[]>(CART_KEY, []).filter((x) => x.productId !== productId);
      writeJson(CART_KEY, items);
      loadLocal();
    },
    [cart, loadLocal, loadServer]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      if (isCustomer(userRef.current)) {
        const line = cart.find((l) => l.product.id === productId);
        if (!line?.id) return;
        setCart((c) => c.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
        void patch(`/api/cart/items/${line.id}`, { quantity })
          .catch((e: Error) => setToast(e.message))
          .finally(() => void loadServer());
        return;
      }
      const items = readJson<CartStoredItem[]>(CART_KEY, []).map((x) =>
        x.productId === productId ? { ...x, quantity } : x
      );
      writeJson(CART_KEY, items);
      loadLocal();
    },
    [cart, loadLocal, loadServer, removeFromCart]
  );

  const clearCart = useCallback(() => {
    if (isCustomer(userRef.current)) {
      // The server empties the cart when an order is placed; remove anything left over.
      const ids = cart.map((l) => l.id).filter(Boolean) as string[];
      setCart([]);
      void Promise.all(ids.map((id) => del(`/api/cart/items/${id}`).catch(() => null))).finally(
        () => void loadServer()
      );
      return;
    }
    if (typeof window !== 'undefined') localStorage.removeItem(CART_KEY);
    loadLocal();
  }, [cart, loadLocal, loadServer]);

  /* ---------- wishlist ---------- */
  const toggleWishlist = useCallback(
    (productId: string, product?: Product) => {
      const adding = !wishlist.includes(productId);
      const known =
        product || cart.find((l) => l.product.id === productId)?.product || resolveProduct(productId);
      if (isCustomer(userRef.current)) {
        setWishlist((w) => (adding ? [...w, productId] : w.filter((x) => x !== productId)));
        setWishlistProducts((w) =>
          adding ? (known ? [...w, known] : w) : w.filter((p) => p.id !== productId)
        );
        const req = adding ? post(`/api/wishlist/${productId}`, {}) : del(`/api/wishlist/${productId}`);
        void req.catch((e: Error) => setToast(e.message)).finally(() => void loadServer());
      } else {
        toggleLocalWishlist(productId, known);
        loadLocal();
      }
      setToast(adding ? 'Saved to your wishlist' : 'Removed from your wishlist');
    },
    [wishlist, cart, loadLocal, loadServer]
  );

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch { }
    setUser(null);
    userRef.current = null;
    loadLocal();
    setToast('Signed out successfully');
  };

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);

  return (
    <AppCtx.Provider
      value={{
        user,
        ready,
        toast,
        cartCount,
        wishlistCount: wishlist.length,
        compareCount,
        cart,
        wishlist,
        wishlistProducts,
        isServerCart: isCustomer(user),
        cartPulse,
        setToast,
        refresh,
        logout,
        updateCounts,
        refreshCart,
        addToCart,
        addCart: addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
