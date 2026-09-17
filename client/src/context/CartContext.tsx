import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Movie } from '../api/movies';

export type CartItem = { movieId: string; title: string; priceCents: number; stock: number; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  addItem(movie: Movie, quantity?: number): void;
  updateQuantity(movieId: string, quantity: number): void;
  removeItem(movieId: string): void;
  clear(): void;
};

const CART_KEY = 'movieflex_cart';
const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0),
    addItem(movie, quantity = 1) {
      setItems((current) => {
        const cap = Math.max(0, movie.stock);
        if (cap === 0) return current;
        const existing = current.find((item) => item.movieId === movie.movieId);
        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, cap);
          return current.map((item) => (item.movieId === movie.movieId ? { ...item, quantity: nextQuantity, stock: cap } : item));
        }
        return [...current, { movieId: movie.movieId, title: movie.title, priceCents: movie.priceCents, stock: cap, quantity: Math.min(quantity, cap) }];
      });
    },
    updateQuantity(movieId, quantity) {
      setItems((current) => current.map((item) => (item.movieId === movieId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item)));
    },
    removeItem(movieId) {
      setItems((current) => current.filter((item) => item.movieId !== movieId));
    },
    clear() { setItems([]); },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
