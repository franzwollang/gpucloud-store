"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";

import type { PageTransitionDef } from "./pageTransition";
import {
	definePageModel,
	type AnyHydratedScope,
	type ClientSnapshotOf,
	type PageClientRuntime,
	type PageModelDefinition,
	type PageStoreBundle
} from "./pageModel";

type PlainState = Record<string, unknown>;

export type ClientPageModel<
	SharedScope extends AnyHydratedScope | undefined = undefined,
	ClientOnlyScope extends AnyHydratedScope = AnyHydratedScope,
	RegistryDefs extends Record<
		string,
		PageTransitionDef<
			any,
			any,
			PageClientRuntime<SharedScope, ClientOnlyScope>
		>
	> = Record<string, never>
> = ReturnType<
	typeof defineClientPageModel<SharedScope, ClientOnlyScope, RegistryDefs>
>;

export type ClientPageModelDefinition<
	SharedScope extends AnyHydratedScope | undefined,
	ClientOnlyScope extends AnyHydratedScope,
	RegistryDefs extends Record<
		string,
		PageTransitionDef<
			any,
			any,
			PageClientRuntime<SharedScope, ClientOnlyScope>
		>
	> = Record<string, never>
> = Omit<
	PageModelDefinition<Record<string, never>, SharedScope, ClientOnlyScope, RegistryDefs>,
	"serverOnly"
>;

type ClientPageModelMarker = {
	__clientSnapshotBrand: PlainState;
	__clientStoreBrand: PlainState;
	createClientStore: (
		snapshot?: Partial<PlainState>
	) => PageStoreBundle<PlainState>;
	PageStoreProvider: React.ComponentType<{
		bundle: PageStoreBundle<PlainState>;
		children: ReactNode;
	}>;
};

/**
 * Page model for client-only apps (SPA, MFE, React Native web views).
 * Omits server-only slices and RSC orchestration; use `bootstrapClientPage` or
 * `ClientPageProvider` to hydrate from API/Query instead of PageShell.
 */
export function defineClientPageModel<
	SharedScope extends AnyHydratedScope | undefined,
	ClientOnlyScope extends AnyHydratedScope,
	RegistryDefs extends Record<
		string,
		PageTransitionDef<
			any,
			any,
			PageClientRuntime<SharedScope, ClientOnlyScope>
		>
	> = Record<string, never>
>(
	config: ClientPageModelDefinition<SharedScope, ClientOnlyScope, RegistryDefs>
) {
	return definePageModel({
		...config,
		serverOnly: undefined
	});
}

export type BootstrapClientPageOptions<Snapshot extends object> = {
	/** Static or route-provided partial snapshot before validation. */
	initial?: Partial<Snapshot>;
	/** Async loader (API, TanStack Query prefetch, etc.). */
	loader?: () => Promise<Partial<Snapshot> | undefined>;
};

export async function bootstrapClientPage<M extends ClientPageModelMarker>(
	model: M,
	opts?: {
		initial?: Partial<ClientSnapshotOf<M>>;
		loader?: () => Promise<Partial<ClientSnapshotOf<M>> | undefined>;
	}
) {
	const partial = opts?.loader ? await opts.loader() : opts?.initial;
	return model.createClientStore(partial ?? {});
}

export type ClientPageProviderProps<M extends ClientPageModelMarker> = {
	model: M;
	/** Sync snapshot — use when data is already available (route loader, parent). */
	initial?: Partial<ClientSnapshotOf<M>>;
	/** Async bootstrap — runs once on mount. */
	loader?: () => Promise<Partial<ClientSnapshotOf<M>> | undefined>;
	fallback?: ReactNode;
	children: ReactNode;
};

/**
 * Client-only page boundary: validates snapshot and mounts the page store +
 * registry without RSC/PageShell.
 */
export function ClientPageProvider<M extends ClientPageModelMarker>(
	props: ClientPageProviderProps<M>
) {
	const { model, initial, loader, fallback, children } = props;
	const [bundle, setBundle] = useState<PageStoreBundle<PlainState> | null>(
		null
	);

	const syncBundle = useMemo(() => {
		if (loader) return null;
		return model.createClientStore(initial ?? {});
	}, [model, initial, loader]);

	useEffect(() => {
		if (!loader) return;

		let cancelled = false;
		void (async () => {
			const resolved = await bootstrapClientPage(model, { loader, initial });
			if (!cancelled) {
				setBundle(resolved);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [model, loader, initial]);

	const activeBundle = syncBundle ?? bundle;
	if (!activeBundle) {
		return fallback ?? null;
	}

	const { PageStoreProvider } = model;
	return (
		<PageStoreProvider bundle={activeBundle}>{children}</PageStoreProvider>
	);
}
