# Page Shell & Advanced State Management Pattern

This directory demonstrates a robust architectural pattern for managing state in Next.js App Router applications, specifically focusing on the intersection of React Server Components (RSC), TanStack Query (TSQ), and Zustand.

## Core Concepts

### 1. `PageShell` Architecture
A reusable Server Component wrapper (`lib/pageShell.tsx`) that encapsulates the boilerplate for:
- **Hydration**: Automatically dehydrating/rehydrating TanStack Query state.
- **Store Initialization**: Setting up page-specific Zustand stores with server-provided initial state.
- **Provider Wrapping**: Ensuring the client tree has access to the correct store and query client contexts.

### 2. `definePageModel`
A strongly-typed builder (`lib/pageModel.ts`) for defining page-specific state that enforces a clear separation of concerns:
- **`serverOnly`**: State that lives strictly on the server (e.g., request tracing IDs, raw feature flags, secrets).
- **`shared`**: State derived on the server but hydrated to the client (e.g., auth status, user preferences, AB test variants).
- **`clientOnly`**: Pure UI state (e.g., form inputs, sidebar toggles, optimistic updates).

### 3. Unified Data Fetching
- **Server-Side**: Direct access to `QueryClient` for prefetching in RSCs.
- **Client-Side**: Standard `useQuery` hooks that hydrate instantly from the server prefetch.
- **Global Caching**: A single global `QueryClient` instance (in `app/layout.tsx`) ensures efficient caching across client-side navigation, while `PageShell` handles the initial server-side hydration.

## Key Files

- **`lib/pageShell.tsx`**: The main orchestrator component.
- **`lib/pageModel.ts`**: The factory for creating strongly-typed stores and snapshots.
- **`app/users/_model.ts`**: Example implementation of a page model with realistic slices.
- **`app/users/page.tsx`**: Example RSC demonstrating how to consume the shell, pass queries, and render data.

## Goals

- **Type Safety**: End-to-end typing from server store definition to client hooks.
- **Performance**: Zero-flicker hydration for shared state; instant data availability via TSQ prefetching.
- **Scalability**: Decouples "page logic" from "UI components," making it easier to maintain complex views.
