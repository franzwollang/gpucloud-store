import { reportWiringPort } from "../errors/parse";
import type {
	QueryKeyLike,
	QueryClientLike
} from "../registry/queryPort";

export type QueryCtx = {
	getQueryClient: () => QueryClientLike | null;
	getQueryData: <T>(key: QueryKeyLike) => T | undefined;
	setQueryData: <T>(
		key: QueryKeyLike,
		updater: T | ((prev: T | undefined) => T)
	) => void;
	invalidateQueries: (filters: { queryKey: QueryKeyLike }) => Promise<void>;
	prefetchQuery: (options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<unknown>;
	}) => Promise<void>;
	fetchQuery: <T>(options: {
		queryKey: QueryKeyLike;
		queryFn: () => Promise<T>;
	}) => Promise<T>;
};

export function makeQueryCtx(
	resolveQueryClient: () => QueryClientLike | null
): QueryCtx {
	return {
		getQueryClient: resolveQueryClient,
		getQueryData: <T>(key: QueryKeyLike) =>
			resolveQueryClient()?.getQueryData(key) as T | undefined,
		setQueryData: <T>(
			key: QueryKeyLike,
			updater: T | ((prev: T | undefined) => T)
		) => {
			const client = resolveQueryClient();
			if (!client) {
				reportWiringPort("setQueryData");
				return;
			}
			client.setQueryData(key, updater);
		},
		invalidateQueries: async (filters) => {
			const client = resolveQueryClient();
			if (!client) {
				reportWiringPort("invalidateQueries");
				return;
			}
			await client.invalidateQueries(filters);
		},
		prefetchQuery: async (options) => {
			const client = resolveQueryClient();
			if (!client) {
				reportWiringPort("prefetchQuery");
				return;
			}
			await client.prefetchQuery(options);
		},
		fetchQuery: async <T>(options: {
			queryKey: QueryKeyLike;
			queryFn: () => Promise<T>;
		}) => {
			const client = resolveQueryClient();
			if (!client) {
				reportWiringPort("fetchQuery");
				throw new Error("No QueryClient available");
			}
			return client.fetchQuery(options) as Promise<T>;
		}
	};
}
