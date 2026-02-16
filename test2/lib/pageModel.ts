import React, { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';

// ----- 1. definePageModel typing/shape -----

type GetQueryData = <T>(key: unknown[]) => T | undefined;

export type StoreCtx<Slice> = {
  get: () => Slice;
  set: (
    updater: Slice | Partial<Slice> | ((s: Slice) => Slice | Partial<Slice>),
    replace?: boolean
  ) => void;
};

export type QueryCtx<Slice> = StoreCtx<Slice> & {
  getQueryData: GetQueryData;
};

// Data shape: the plain objects for each slice (no functions)
export type PageModelStateShape = {
  serverOnly?: Record<string, unknown>;
  shared?: Record<string, unknown>;
  clientOnly: Record<string, unknown>;
};

// Config shape: builder functions typed from the data shape
export type PageModelConfig<Shape extends PageModelStateShape> = {
  serverOnly?: (
    ctx: StoreCtx<NonNullable<Shape['serverOnly']>>
  ) => NonNullable<Shape['serverOnly']>;
  shared?: (
    ctx: StoreCtx<NonNullable<Shape['shared']>>
  ) => NonNullable<Shape['shared']>;
  clientOnly: (
    ctx: StoreCtx<NonNullable<Shape['clientOnly']>>
  ) => NonNullable<Shape['clientOnly']>;
};

export type StoreHook<S> = {
  <T>(selector: (s: S) => T): T;
  setState: StoreApi<S>['setState'];
};

// ----- 2. Type helpers to extract server/client shapes -----

export type ServerStateOf<M> = M extends { __serverBrand: infer S } ? S : never;
export type ClientStateOf<M> = M extends { __clientBrand: infer S } ? S : never;

// ----- 3. Generic React wiring for client store (per page) -----

function createPageStoreHooks<C>() {
  const Ctx = createContext<StoreApi<C> | null>(null);
  const storeRef: { current: StoreApi<C> | null } = { current: null };

  const usePageStore = (selector => {
    const store = useContext(Ctx);
    if (!store) {
      throw new Error('usePageStore must be used within <PageStoreProvider>');
    }
    return useStore(store, selector);
  }) as StoreHook<C>;

  const setState = (
    ...args: Parameters<StoreApi<C>['setState']>
  ): ReturnType<StoreApi<C>['setState']> => {
    const store = storeRef.current;
    if (!store) {
      throw new Error('usePageStore.setState must be used within provider');
    }
    return store.setState(...args);
  };

  usePageStore.setState = setState as StoreApi<C>['setState'];

  function PageStoreProvider(props: {
    store: StoreApi<C>;
    children: React.ReactNode;
  }) {
    storeRef.current = props.store;
    return React.createElement(
      Ctx.Provider,
      { value: props.store },
      props.children
    );
  }

  return { usePageStore, PageStoreProvider };
}

// ----- 4. definePageModel -----

export function definePageModel<Shape extends PageModelStateShape>(
  shape: PageModelConfig<Shape>
) {
  type ServerState = NonNullable<Shape['serverOnly']> &
    NonNullable<Shape['shared']> &
    NonNullable<Shape['clientOnly']>;
  type ClientState = NonNullable<Shape['shared']> &
    NonNullable<Shape['clientOnly']>;

  const serverOnlyBuilder =
    shape.serverOnly ?? (() => ({}) as NonNullable<Shape['serverOnly']>);
  const sharedBuilder =
    shape.shared ?? (() => ({}) as NonNullable<Shape['shared']>);
  const clientOnlyBuilder = shape.clientOnly;

  const makeCtx = <S>(): StoreCtx<S> => ({
    get: (() => ({}) as unknown as S) as () => S,
    set: (() => undefined) as (updater: unknown) => void
  });

  const makeClientSnapshotFromServer = (
    serverState: ServerState
  ): ClientState => {
    const clientKeys = new Set([
      ...Object.keys(
        sharedBuilder({
          get: () => ({}) as NonNullable<Shape['shared']>,
          set: () => undefined
        })
      ),
      ...Object.keys(
        clientOnlyBuilder({
          get: () => ({}) as NonNullable<Shape['clientOnly']>,
          set: () => undefined
        })
      )
    ]);

    const result: Record<string, unknown> = {};
    const serverRecord: Record<string, unknown> = serverState;
    Array.from(clientKeys).forEach(key => {
      result[key] = serverRecord[key];
    });
    return result as ClientState;
  };

  // Allow partial overrides for server store (e.g. injecting fetched data)
  const createServerStore = (overrides?: Partial<ServerState>) => {
    const serverOnlyCtx = makeCtx<NonNullable<Shape['serverOnly']>>();
    const sharedCtx = makeCtx<NonNullable<Shape['shared']>>();
    const clientOnlyCtx = makeCtx<NonNullable<Shape['clientOnly']>>();

    const base = {
      ...serverOnlyBuilder(serverOnlyCtx),
      ...sharedBuilder(sharedCtx),
      ...clientOnlyBuilder(clientOnlyCtx),
      ...overrides
    } as ServerState;

    return createStore<ServerState>()(set => ({
      ...base,
      reset: () => set(base)
    }));
  };

  const createClientStore = (snapshot: Partial<ClientState> = {}) => {
    const sharedCtx = makeCtx<NonNullable<Shape['shared']>>();
    const clientOnlyCtx = makeCtx<NonNullable<Shape['clientOnly']>>();
    const base = {
      ...sharedBuilder(sharedCtx),
      ...clientOnlyBuilder(clientOnlyCtx),
      ...snapshot
    } as ClientState;

    return createStore<ClientState>()(set => ({
      ...base,
      reset: () => set(base)
    }));
  };

  const hooks = createPageStoreHooks<ClientState>();

  return {
    shape,
    makeClientSnapshotFromServer,
    // server-side convenience: build store and return state
    getServerState: (overrides?: Partial<ServerState>) =>
      createServerStore(overrides).getState(),
    createServerStore,
    createClientStore,
    ...hooks,
    // phantom brands for helper types
    __serverBrand: {} as ServerState,
    __clientBrand: {} as ClientState
  };
}
