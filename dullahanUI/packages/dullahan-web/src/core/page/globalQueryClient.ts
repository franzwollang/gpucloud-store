import type { QueryClientLike } from "../registry/queryPort";

let globalClient: QueryClientLike | null = null;

/** Publish the layout's query client for imperative client-side cache access. */
export function publishQueryClient(client: QueryClientLike): void {
	globalClient = client;
}

export function getQueryClient(): QueryClientLike | null {
	return globalClient;
}

export function resetQueryClient(): void {
	globalClient = null;
}
