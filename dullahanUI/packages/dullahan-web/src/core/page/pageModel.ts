import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

import {
	createTransitionRegistry,
	type DullahanResult,
	type TransitionDef,
	type TransitionRegistry
} from "../registry/registry";
import { toUserMessage } from "../errors/format";
import type { DullahanError } from "../errors/types";
import { createQueryPort } from "../registry/queryPort";
import { getQueryClient } from "./globalQueryClient";
import {
	buildScopeState,
	extractScopeJson,
	parseScopeSnapshot,
	type AnyHydratedScope,
	type SharedStateOf,
	type StateOfScope
} from "./hydratedScope";
import type { JsonValue } from "./hydratedScope";
import {
	adaptPageTransitionDefs,
	type PageTransitionDef
} from "./pageTransition";
import type { PageScopeKeys } from "./pageTransitionCtx";

// ----- Core typing -----

type PlainState = Record<string, unknown>;

export type StoreHook<S> = {
	<T>(selector: (s: S) => T): T;
};

export type ServerDataOf<M> = M extends { __serverDataBrand: infer D }
	? D
	: never;
export type ClientSnapshotOf<M> = M extends { __clientSnapshotBrand: infer S }
	? S
	: never;
export type ClientStoreOf<M> = M extends { __clientStoreBrand: infer S }
	? S
	: never;
export type ServerStoreOf<M> = M extends { __serverStoreBrand: infer S }
	? S
	: never;

type ServerOnlySlice<ServerOnlyState extends PlainState> = {
	state: () => ServerOnlyState;
};

type SharedHydratedSlice<SharedScope extends AnyHydratedScope> = {
	scope: SharedScope;
};

type ClientOnlyHydratedSlice<ClientOnlyScope extends AnyHydratedScope> = {
	scope: ClientOnlyScope;
};

export type PageClientRuntime<
	SharedScope extends AnyHydratedScope | undefined,
	ClientOnlyScope extends AnyHydratedScope
> = SharedStateOf<SharedScope> &
	StateOfScope<ClientOnlyScope> & { reset: () => void };

export type PageModelDefinition<
	ServerOnlyState extends PlainState = Record<string, never>,
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
> = {
	serverOnly?: ServerOnlySlice<ServerOnlyState>;
	shared?: [SharedScope] extends [AnyHydratedScope]
		? SharedHydratedSlice<SharedScope>
		: never;
	clientOnly: ClientOnlyHydratedSlice<ClientOnlyScope>;
	/** Canonical mutation surface — Transition Registry definitions for this page. */
	transitions?: RegistryDefs;
};

export type PageStoreBundle<Runtime extends PlainState> = {
	store: StoreApi<Runtime>;
	registry: TransitionRegistry<
		Runtime,
		Record<string, TransitionDef<any, any, Runtime>>
	> | null;
};

function scopeKeySet(scope: AnyHydratedScope | undefined): ReadonlySet<string> {
	if (!scope) return new Set();
	return new Set(Object.keys(scope.build()));
}

function buildPageScopeKeys(
	sharedScope: AnyHydratedScope | undefined,
	clientOnlyScope: AnyHydratedScope
): PageScopeKeys {
	return {
		shared: scopeKeySet(sharedScope),
		client: scopeKeySet(clientOnlyScope)
	};
}

function createPageRegistry<Snapshot extends PlainState, RegistryDefs extends Record<string, PageTransitionDef<any, any, Snapshot>>>(
	store: StoreApi<Snapshot>,
	registryDefs: RegistryDefs | undefined,
	scopeKeys: PageScopeKeys,
	resolveQueryClient: () => ReturnType<typeof getQueryClient>
) {
	if (!registryDefs || Object.keys(registryDefs).length === 0) {
		return null;
	}

	const adapted = adaptPageTransitionDefs(
		registryDefs,
		scopeKeys,
		resolveQueryClient
	);

	const queryPort = createQueryPort(resolveQueryClient);

	return createTransitionRegistry({
		store,
		transitions: adapted,
		query: queryPort
	});
}

// ----- React wiring -----

export type UsePageTransitionResult<Output> = {
	execute: (input: unknown) => Promise<DullahanResult<Output | null>>;
	pending: boolean;
	error: DullahanError | null;
	message: string | null;
};

function createPageStoreHooks<
	Runtime extends PlainState,
	RegistryDefs extends Record<
		string,
		PageTransitionDef<any, any, Runtime>
	> = Record<string, never>
>() {
	const StoreCtx = createContext<StoreApi<Runtime> | null>(null);
	const RegistryCtx = createContext<TransitionRegistry<
		Runtime,
		Record<string, TransitionDef<any, any, Runtime>>
	> | null>(null);

	const usePageStore = ((selector: (state: Runtime) => unknown) => {
		const store = useContext(StoreCtx);
		if (!store) {
			throw new Error("usePageStore must be used within <PageStoreProvider>");
		}
		return useStore(store, selector as (s: Runtime) => unknown);
	}) as StoreHook<Runtime>;

	function useTransition<K extends keyof RegistryDefs & string>(
		name: K
	): UsePageTransitionResult<
		RegistryDefs[K] extends PageTransitionDef<any, infer O, any> ? O : never
	> {
		const registry = useContext(RegistryCtx);
		if (!registry) {
			throw new Error(
				"useTransition requires definePageModel({ transitions: { ... } }) " +
					"and a store created via createClientStore inside <PageStoreProvider>"
			);
		}

		const [pending, setPending] = useState(false);
		const [error, setError] = useState<DullahanError | null>(null);

		const execute = useCallback(
			async (input: unknown) => {
				setPending(true);
				setError(null);
				try {
					const result = await registry.execute(name, input);
					if (!result.ok) {
						setError(result.error);
					}
					return result;
				} finally {
					setPending(false);
				}
			},
			[registry, name]
		);

		const message = useMemo(
			() => (error ? toUserMessage(error) : null),
			[error]
		);

		return {
			execute,
			pending,
			error,
			message
		} as UsePageTransitionResult<
			RegistryDefs[K] extends PageTransitionDef<any, infer O, any>
				? O
				: never
		>;
	}

	function PageStoreProvider(props: {
		bundle: PageStoreBundle<Runtime>;
		children: React.ReactNode;
	}) {
		return React.createElement(
			RegistryCtx.Provider,
			{ value: props.bundle.registry },
			React.createElement(
				StoreCtx.Provider,
				{ value: props.bundle.store },
				props.children
			)
		);
	}

	return { usePageStore, useTransition, PageStoreProvider };
}

// ----- definePageModel -----

export function definePageModel<
	ServerOnlyState extends PlainState,
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
	config: PageModelDefinition<
		ServerOnlyState,
		SharedScope,
		ClientOnlyScope,
		RegistryDefs
	>
) {
	type SharedState = SharedStateOf<SharedScope>;
	type ClientOnlyState = StateOfScope<ClientOnlyScope>;
	type ServerData = ServerOnlyState & SharedState & ClientOnlyState;
	type ClientSnapshot = SharedState & ClientOnlyState;
	type ServerRuntime = ServerData & { reset: () => void };
	type ClientRuntime = ClientSnapshot & { reset: () => void };

	const sharedScope = config.shared?.scope;
	const clientOnlyScope = config.clientOnly.scope;
	const pageScopeKeys = buildPageScopeKeys(sharedScope, clientOnlyScope);
	const registryDefs = config.transitions as
		| RegistryDefs
		| undefined;

	const buildSharedState = () =>
		buildScopeState(sharedScope) as SharedState;
	const buildClientOnlyState = () =>
		buildScopeState(clientOnlyScope) as ClientOnlyState;
	const serverOnlyState =
		config.serverOnly?.state ?? (() => ({} as ServerOnlyState));

	const buildServerData = (overrides?: Partial<ServerData>): ServerData =>
		({
			...serverOnlyState(),
			...buildSharedState(),
			...buildClientOnlyState(),
			...overrides
		}) as ServerData;

	const parseClientSnapshot = (raw: unknown): ClientSnapshot => {
		const source =
			typeof raw === "object" && raw !== null ? raw : {};

		return {
			...parseScopeSnapshot(sharedScope, source),
			...parseScopeSnapshot(clientOnlyScope, source)
		} as ClientSnapshot;
	};

	const makeClientSnapshotFromServer = (
		serverData: ServerData
	): ClientSnapshot => {
		const sharedKeys = Object.keys(buildSharedState());
		const clientKeys = Object.keys(buildClientOnlyState());
		const result: Record<string, unknown> = {};

		for (const key of [...sharedKeys, ...clientKeys]) {
			result[key] = serverData[key as keyof ServerData];
		}

		return result as ClientSnapshot;
	};

	const getPersistableState = (
		snapshot: ClientSnapshot
	): Record<string, JsonValue> => ({
		...extractScopeJson(sharedScope, snapshot),
		...extractScopeJson(clientOnlyScope, snapshot)
	});

	type CreateServerStoreArgs = {
		overrides?: Partial<ServerData>;
		queryClient?: NonNullable<ReturnType<typeof getQueryClient>>;
	};

	const createServerStore = (args?: CreateServerStoreArgs) => {
		const overrides = args?.overrides;
		const initialData = buildServerData(overrides);

		return createStore<ServerRuntime>()((set) => ({
			...initialData,
			reset: () => set({ ...initialData } as ServerRuntime)
		}));
	};

	const createClientStore = (
		snapshot: Partial<ClientSnapshot> = {}
	): PageStoreBundle<ClientRuntime> => {
		const parsed = parseClientSnapshot(snapshot);
		const resolveQueryClient = () => getQueryClient();

		const store = createStore<ClientRuntime>()((set) => {
			return {
				...parsed,
				reset: () => set({ ...parsed } as ClientRuntime)
			} as ClientRuntime;
		});

		const registry = createPageRegistry(
			store,
			registryDefs,
			pageScopeKeys,
			resolveQueryClient
		);

		return {
			store,
			registry: registry as PageStoreBundle<ClientRuntime>["registry"]
		};
	};

	const hooks = createPageStoreHooks<ClientRuntime, RegistryDefs>();

	return {
		config,
		scopes: {
			shared: sharedScope,
			clientOnly: clientOnlyScope
		},
		parseClientSnapshot,
		makeClientSnapshotFromServer,
		getPersistableState,
		getServerData: (overrides?: Partial<ServerData>) =>
			buildServerData(overrides),
		createServerStore,
		createClientStore,
		...hooks,
		__serverDataBrand: {} as ServerData,
		__clientSnapshotBrand: {} as ClientSnapshot,
		__clientStoreBrand: {} as ClientRuntime,
		__serverStoreBrand: {} as ServerRuntime
	};
}

export type { QueryCtx } from "./queryCtx";

export {
	defineHydratedScope,
	type HydratedScopeDef,
	type AnyHydratedScope,
	type StateOfScope,
	type SharedStateOf,
	type JsonValue,
	type RscValue
} from "./hydratedScope";

export {
	definePageTransition,
	type PageTransitionDef
} from "./pageTransition";

export { publishQueryClient, getQueryClient } from "./globalQueryClient";
