// yugen-mobile/stores/headerTitleStore.ts
import { create } from "zustand";

export const useHeaderTitleStore = create((set) => ({
  title: "",
  setTitle: (title: string) => set({ title }),
  resetTitle: () => set({ title: "" }),
}));
