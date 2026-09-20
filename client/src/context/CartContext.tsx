import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as orderApi from '../api/orders';
import type { Order, OrderDetail } from '../api/orders';
import { useAuth } from './AuthContext';

export type CartItem = {
  movieId: string;
  title: string;
  priceCents: number;
  stock: number;
  quantity: number;
  posterUrl: string | null;
  genre: string;
  classification: string;
  releaseDate: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  addItem(movie: { movieId: string }, quantity?: number): Promise<void>;
  updateQuantity(movieId: string, quantity: number): Promise<void>;
  removeItem(movieId: string): Promise<void>;
  clear(): void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toCartItems(order: Order): CartItem[] {
  return order.details.map((detail: OrderDetail) => ({
    movieId: detail.movieId,
    title: detail.title,
    priceCents: detail.unitPriceCents,
    stock: detail.stock,
    quantity: detail.quantity,
    posterUrl: detail.posterUrl,
    genre: detail.genre,
    classification: detail.classification,
    releaseDate: detail.releaseDate,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!token) { setItems([]); return; }
    orderApi.getCart(token).then((order) => setItems(toCartItems(order))).catch(() => setItems([]));
  }, [token]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0),
    async addItem(movie, quantity = 1) {
      if (!token) return;
      const order = await orderApi.addCartItem(movie.movieId, quantity, token);
      setItems(toCartItems(order));
    },
    async updateQuantity(movieId, quantity) {
      if (!token) return;
      const order = await orderApi.updateCartItem(movieId, quantity, token);
      setItems(toCartItems(order));
    },
    async removeItem(movieId) {
      if (!token) return;
      const order = await orderApi.removeCartItem(movieId, token);
      setItems(toCartItems(order));
    },
    clear() { setItems([]); },
  }), [items, token]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
