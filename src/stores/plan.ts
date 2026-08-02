import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

export type PlanItem = {
  id: string;
  title: string;
  specs: string;
  price: string;
  /** Catalog feed id for CatalogAttribution under this price, when known. */
  priceSourceId?: string;
  details: string;
  quantity: number;
  gpuModel?: string;
  gpuCount?: number;
  region?: string;
  provider?: {
    id?: string;
    name?: string;
    location?: string;
  };
};

type PlanState = {
  items: PlanItem[];
  addItem: (item: Omit<PlanItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  decrementItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Omit<PlanItem, 'id'>>) => void;
  clearPlan: () => void;
  getTotalItems: () => number;
};

const getPlanItemKey = (item: Omit<PlanItem, 'id' | 'quantity'> | PlanItem) => {
  const providerId = item.provider?.id ?? '';
  const providerName = item.provider?.name ?? '';
  const providerLocation = item.provider?.location ?? '';
  const hasStructured =
    item.gpuModel ||
    item.gpuCount != null ||
    item.region ||
    providerId ||
    providerName ||
    providerLocation;

  if (hasStructured) {
    return [
      `model:${item.gpuModel ?? ''}`,
      `count:${item.gpuCount ?? ''}`,
      `region:${item.region ?? ''}`,
      `provider:${providerId || providerName}`,
      `location:${providerLocation}`
    ].join('|');
  }

  return [
    `title:${item.title}`,
    `specs:${item.specs}`,
    `price:${item.price}`,
    `details:${item.details}`
  ].join('|');
};

const createPlanId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Object selectors are safe — store default equality is shallow. */
export const usePlanStore = createWithEqualityFn<PlanState>()((set, get) => ({
  items: [],

  addItem: item => {
    const items = get().items;
    const incomingKey = getPlanItemKey(item);
    const existingIndex = items.findIndex(
      existing => getPlanItemKey(existing) === incomingKey
    );

    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      if (!existing) return;
      const merged: PlanItem = {
        ...existing,
        title: item.title,
        specs: item.specs,
        price: item.price,
        priceSourceId: item.priceSourceId ?? existing.priceSourceId,
        details: item.details,
        gpuModel: item.gpuModel ?? existing.gpuModel,
        gpuCount: item.gpuCount ?? existing.gpuCount,
        region: item.region ?? existing.region,
        provider: item.provider
          ? { ...existing.provider, ...item.provider }
          : existing.provider,
        quantity: existing.quantity + 1
      };

      set({
        items: items.map((entry, idx) =>
          idx === existingIndex ? merged : entry
        )
      });
      return;
    }

    set({
      items: [
        ...items,
        {
          ...item,
          id: createPlanId(),
          quantity: 1
        }
      ]
    });
  },

  removeItem: id => {
    set({
      items: get().items.filter(item => item.id !== id)
    });
  },

  decrementItem: id => {
    const items = get().items;
    const target = items.find(item => item.id === id);
    if (!target) return;
    if (target.quantity > 1) {
      set({
        items: items.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      });
    } else {
      set({
        items: items.filter(item => item.id !== id)
      });
    }
  },

  updateItem: (id, updates) => {
    set({
      items: get().items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  },

  clearPlan: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}), shallow);
