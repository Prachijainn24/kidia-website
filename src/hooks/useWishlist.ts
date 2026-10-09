import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  toggle: (id: string) => boolean; // returns true if now saved
  remove: (id: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !has;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: "kidia-wishlist" }
  )
);

interface RecentState { ids: string[]; push: (id: string) => void }
export const useRecent = create<RecentState>()(
  persist((set, get) => ({ ids: [], push: (id) => set({ ids: [id, ...get().ids.filter((x) => x !== id)].slice(0, 8) }) }), { name: "kidia-recent" })
);
