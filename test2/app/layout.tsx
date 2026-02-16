'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useGlobalStore } from '../globalStore';

type RootLayoutProps = {
  children: React.ReactNode | Array<React.ReactNode>;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const setGlobalQueryClient = useGlobalStore(
    state => state.setGlobalQueryClient
  );

  const globalQueryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    setGlobalQueryClient(globalQueryClient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={globalQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
