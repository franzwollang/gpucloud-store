import type { QueryClientLike } from "../registry/queryPort";
import type { TransitionCtx } from "../registry/registry";
import { errorPolicies, internalError, presentError } from "../errors";
import { makeQueryCtx, type QueryCtx } from "./queryCtx";

type PlainState = Record<string, unknown>;

function isNonProduction(): boolean {
	const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
		.process;
	return proc?.env?.NODE_ENV !== "production";
}

function filterPatch<Store extends PlainState>(
	patch: Partial<Store>,
	allowed: ReadonlySet<string>,
	label: string
): Partial<Store> {
	if (isNonProduction()) {
		for (const key of Object.keys(patch)) {
			if (!allowed.has(key)) {
				presentError(
					internalError(
						"SCOPE_KEY_IGNORED",
						new Error(
							`PageTransitionCtx.${label}: ignoring key "${key}"`
						),
						{
							message: `PageTransitionCtx.${label}: ignoring key "${key}"`
						}
					),
					{
						concern: "wiring.port",
						id: `${label}.${key}`,
						runtime: "client"
					},
					errorPolicies.wiring.port()
				);
				delete patch[key as keyof Store];
			}
		}
	}
	return patch;
}

export type PageTransitionCtx<Store extends PlainState> = TransitionCtx<Store> &
	QueryCtx & {
		get: () => Store;
		setShared: (
			updater: Partial<Store> | ((state: Store) => Partial<Store>)
		) => void;
		setClient: (
			updater: Partial<Store> | ((state: Store) => Partial<Store>)
		) => void;
		setAll: (
			updater: Partial<Store> | ((state: Store) => Partial<Store>)
		) => void;
	};

export type PageScopeKeys = {
	shared: ReadonlySet<string>;
	client: ReadonlySet<string>;
};

export function createPageTransitionCtx<Store extends PlainState>(
	base: TransitionCtx<Store>,
	scopeKeys: PageScopeKeys,
	resolveQueryClient: () => QueryClientLike | null
): PageTransitionCtx<Store> {
	const { store, query } = base;
	const allowedAll = new Set([...scopeKeys.shared, ...scopeKeys.client]);

	return {
		store,
		query,
		...makeQueryCtx(resolveQueryClient),
		get: () => store.getState(),
		setShared: (updater) => {
			store.setState((current) => {
				const patch =
					typeof updater === "function" ? updater(current) : updater;
				return filterPatch(
					{ ...patch } as Partial<Store>,
					scopeKeys.shared,
					"setShared"
				);
			});
		},
		setClient: (updater) => {
			store.setState((current) => {
				const patch =
					typeof updater === "function" ? updater(current) : updater;
				return filterPatch(
					{ ...patch } as Partial<Store>,
					scopeKeys.client,
					"setClient"
				);
			});
		},
		setAll: (updater) => {
			store.setState((current) => {
				const patch =
					typeof updater === "function" ? updater(current) : updater;
				return filterPatch(
					{ ...patch } as Partial<Store>,
					allowedAll,
					"setAll"
				);
			});
		}
	};
}
