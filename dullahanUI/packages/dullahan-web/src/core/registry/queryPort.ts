/**
 * QueryPort: a thin, library-agnostic wrapper over a server-cache client
 * (TanStack Query by default). Transitions orchestrate the cache through this
 * port — invalidate, peek, seed — while query payloads stay in the cache and
 * never enter Zustand slices.
 */

export type QueryKeyLike = ReadonlyArray<unknown>;

export type QueryPort = {
	getData<T>(key: QueryKeyLike): T | undefined;
	setData<T>(key: QueryKeyLike, updater: T | ((prev: T | undefined) => T)): void;
	invalidate(key: QueryKeyLike): Promise<void>;
	prefetch(options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<unknown>;
	}): Promise<void>;
	fetch<T>(options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<T>;
	}): Promise<T>;
};

/**
 * Structural view of a query cache client — matches the subset of
 * `@tanstack/react-query` QueryClient used by this port.
 */
export type QueryClientLike = {
	getQueryData(key: QueryKeyLike): unknown;
	setQueryData(key: QueryKeyLike, updater: unknown): unknown;
	invalidateQueries(filters: { queryKey: QueryKeyLike }): Promise<void>;
	prefetchQuery(options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<unknown>;
	}): Promise<void>;
	fetchQuery(options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<unknown>;
	}): Promise<unknown>;
};

type QueryClientResolver = () => QueryClientLike | null;

function asResolver(
	clientOrResolver: QueryClientLike | QueryClientResolver
): QueryClientResolver {
	return typeof clientOrResolver === "function"
		? clientOrResolver
		: () => clientOrResolver;
}

/**
 * Build a QueryPort from a client or a resolver called on every operation.
 * Lazy resolution is the default — pass `() => client` when the client is
 * published after store creation.
 */
export function createQueryPort(
	clientOrResolver: QueryClientLike | QueryClientResolver
): QueryPort {
	const resolveClient = asResolver(clientOrResolver);

	return {
		getData: <T>(key: QueryKeyLike) =>
			resolveClient()?.getQueryData(key) as T | undefined,
		setData: <T>(
			key: QueryKeyLike,
			updater: T | ((prev: T | undefined) => T)
		) => {
			const client = resolveClient();
			if (!client) {
				reportWiringPort("setData");
				return;
			}
			client.setQueryData(key, updater);
		},
		invalidate: async (key) => {
			const client = resolveClient();
			if (!client) {
				reportWiringPort("invalidate");
				return;
			}
			await client.invalidateQueries({ queryKey: key });
		},
		prefetch: async (options) => {
			const client = resolveClient();
			if (!client) {
				reportWiringPort("prefetch");
				return;
			}
			await client.prefetchQuery(options);
		},
		fetch: <T>(options: {
			queryKey: QueryKeyLike;
			queryFn: () => Promise<T>;
		}) => {
			const client = resolveClient();
			if (!client) {
				reportWiringPort("fetch");
				return Promise.reject(
					new Error("QueryPort.fetch requires a wired query client")
				);
			}
			return client.fetchQuery(options) as Promise<T>;
		}
	};
}

import { reportWiringPort } from "../errors/parse";

export const noopQueryPort: QueryPort = {
	getData: () => {
		reportWiringPort("getData");
		return undefined;
	},
	setData: () => reportWiringPort("setData"),
	invalidate: async () => reportWiringPort("invalidate"),
	prefetch: async () => reportWiringPort("prefetch"),
	fetch: () => {
		reportWiringPort("fetch");
		return Promise.reject(
			new Error("QueryPort.fetch requires a wired query client")
		);
	}
};
