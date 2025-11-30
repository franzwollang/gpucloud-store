import { create } from 'zustand';

export type PlanItem = {
  id: string;
  title: string;
  specs: string;
  price: string;
  details: string;
  quantity: number;
};

type PlanState = {
  items: PlanItem[];
  addItem: (item: Omit<PlanItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  clearPlan: () => void;
  getTotalItems: () => number;
};

export const usePlanStore = create<PlanState>((set, get) => ({
  items: [],

  addItem: item => {
    const items = get().items;
    // Use title as a unique identifier
    const existingItem = items.find(i => i.title === item.title);

    if (existingItem) {
      // Increment quantity if item already exists
      set({
        items: items.map(i =>
          i.title === item.title ? { ...i, quantity: i.quantity + 1 } : i
        )
      });
    } else {
      // Add new item with quantity 1
      set({
        items: [
          ...items,
          {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            quantity: 1
          }
        ]
      });
    }
  },

  removeItem: id => {
    set({
      items: get().items.filter(item => item.id !== id)
    });
  },

  clearPlan: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
