import { type QueryClient } from '@tanstack/react-query';
import { createStore, useStore } from 'zustand';

type GlobalState = {
  globalQueryClient: QueryClient | null;
  setGlobalQueryClient: (queryClient: QueryClient) => void;
};

const globalStore = createStore<GlobalState>()((_get, set) => ({
  globalQueryClient: null,
  setGlobalQueryClient: (queryClient: QueryClient) => {
    set(state => ({ ...state, globalQueryClient: queryClient }));
  }
}));

export function useGlobalStore<T>(selector: (state: GlobalState) => T): T {
  return useStore(globalStore, selector);
}
