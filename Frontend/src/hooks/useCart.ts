import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products, Product } from "@/data/catalog";

export interface CartLine { key: string; productId: string; size: string; colour: string; quantity: number }

interface CartState {
  lines: CartLine[];
  add: (p: Product, size: string, colour: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const maxFor = (productId: string, size: string) => products.find((p) => p.id === productId)?.stock[size] ?? 0;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (p, size, colour, qty = 1) =>
        set((s) => {
          const key = `${p.id}|${size}|${colour}`;
          const max = maxFor(p.id, size);
          const found = s.lines.find((l) => l.key === key);
          if (found) return { lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + qty, max) } : l)) };
          return { lines: [...s.lines, { key, productId: p.id, size, colour, quantity: Math.min(qty, max) }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines.flatMap((l) => (l.key !== key ? [l] : qty < 1 ? [] : [{ ...l, quantity: Math.min(qty, maxFor(l.productId, l.size)) }])),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "kidia-cart" }
  )
);

export const useCartCount = () => useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
export const lineProduct = (l: CartLine) => products.find((p) => p.id === l.productId)!;
