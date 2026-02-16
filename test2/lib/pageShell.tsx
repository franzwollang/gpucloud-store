import {
  dehydrate,
  type FetchQueryOptions,
  HydrationBoundary,
  QueryClient,
  type QueryFunction,
  type QueryKey
} from '@tanstack/react-query';
import React from 'react';
import type { StoreApi } from 'zustand';

import { PageStoreClientProvider } from './pageShellClient';

export type ServerQuery<TData = unknown, TKey extends QueryKey = QueryKey> = {
  options: FetchQueryOptions<TData, Error, TData, TKey> & {
    queryFn: QueryFunction<TData, TKey>;
  };
};

export type PageShellModel<ClientState = unknown, ServerState = unknown> = {
  createServerStore: (overrides?: Partial<ServerState>) => {
    getState: () => ServerState;
  };
  makeClientSnapshotFromServer: (serverState: ServerState) => ClientState;
  createClientStore: (snapshot: ClientState) => StoreApi<ClientState>;
  PageStoreProvider: React.ComponentType<{
    store: StoreApi<ClientState>;
    children: React.ReactNode;
  }>;
};

type QueryResults<Q extends readonly ServerQuery[]> = {
  [K in keyof Q]: Awaited<ReturnType<Q[K]['options']['queryFn']>>;
};

type PageShellProps<
  ClientState,
  ServerState,
  Q extends readonly ServerQuery[]
> = {
  model: PageShellModel<ClientState, ServerState>;
  queries?: Q;
  buildOverrides?: () => Partial<ServerState>;
  queryClient?: QueryClient;
  children?:
    | React.ReactNode
    | ((data: {
        results: QueryResults<Q>;
        serverState: ServerState; // full server-side store state
        snapshot: ClientState; // hydrated subset (shared + clientOnly)
      }) => React.ReactNode);
};

export async function PageShell<
  ClientState,
  ServerState,
  Q extends readonly ServerQuery[] = []
>(props: PageShellProps<ClientState, ServerState, Q>) {
  const queryClient = props.queryClient ?? new QueryClient();

  const fetchQueries = async (): Promise<QueryResults<Q>> => {
    if (!props.queries?.length) {
      return [] as unknown as QueryResults<Q>;
    }
    const fetched = await Promise.all(
      props.queries.map(q =>
        queryClient.fetchQuery<
          Awaited<ReturnType<typeof q.options.queryFn>>,
          Error,
          Awaited<ReturnType<typeof q.options.queryFn>>,
          typeof q.options.queryKey
        >(q.options)
      )
    );
    return fetched as QueryResults<Q>;
  };

  const results = await fetchQueries();

  const overrides = props.buildOverrides?.() ?? {};

  const {
    createServerStore,
    makeClientSnapshotFromServer,
    createClientStore,
    PageStoreProvider
  } = props.model;

  const serverStore = createServerStore(overrides);
  const serverState = serverStore.getState();
  const snapshot = makeClientSnapshotFromServer(serverState);
  const dehydratedQueryClient = dehydrate(queryClient);

  const content =
    typeof props.children === 'function'
      ? (
          props.children as (data: {
            results: QueryResults<Q>;
            snapshot: ClientState;
            serverState: ServerState;
          }) => React.ReactNode
        )({ results, snapshot, serverState })
      : props.children;

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <PageStoreClientProvider
        model={{ createClientStore, PageStoreProvider }}
        snapshot={snapshot}
      >
        {content}
      </PageStoreClientProvider>
    </HydrationBoundary>
  );
}
