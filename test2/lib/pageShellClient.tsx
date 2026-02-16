'use client';

import { useMemo } from 'react';
import type { StoreApi } from 'zustand';

import type { PageShellModel } from './pageShell';

// Generic client-side wrapper that instantiates the client store from a snapshot
// and provides it via the page model's PageStoreProvider.
export function PageStoreClientProvider<ClientState>(props: {
  model: Pick<
    PageShellModel<ClientState>,
    'createClientStore' | 'PageStoreProvider'
  >;
  snapshot: ClientState;
  children: React.ReactNode | Array<React.ReactNode>;
}) {
  const { createClientStore, PageStoreProvider } = props.model;

  const store: StoreApi<ClientState> = useMemo(
    () => createClientStore(props.snapshot),
    [props.snapshot, createClientStore]
  );

  return <PageStoreProvider store={store}>{props.children}</PageStoreProvider>;
}

