import type { StoreApi } from "zustand";
import type { ErrorPolicy } from "../errors/policy";
import type {
	DullahanResult
} from "../errors/types";
import {
	assertKnownTransition,
	parseTransitionInput,
	resolveServerActionResult,
	runTransitionApply
} from "../errors/parse";
import { errorFromThrown, ok } from "../errors/kinds";
import type { ZodSchema } from "../state/schemaSlice";
import { noopQueryPort, type QueryPort } from "./queryPort";

/**
 * Transition Registry: the single canonical mutation surface.
 *
 * Components invoke registry transitions via hooks; XState machines invoke the
 * same entries via ports. Every transition is named, Zod-validated, and
 * tier-tagged — making the registry simultaneously the command-palette source,
 * the LLM tool manifest, the audit vocabulary, and the server-mirror contract.
 */

export type TransitionTier = "projection" | "committed";

export type { DullahanResult };

export type TransitionCtx<Store extends object> = {
	store: StoreApi<Store>;
	query: QueryPort;
};

export type TransitionDef<
	Input,
	Output = void,
	Store extends object = object
> = {
	/** Namespaced name, e.g. `ui.setTheme`, `users.delete`. */
	name: string;
	/**
	 * - `projection` — client-local; `apply` is the whole effect
	 * - `committed`  — server-finalized; `serverAction` is authoritative,
	 *   `apply` is the optimistic write, `onError` rolls back
	 */
	tier: TransitionTier;
	/** Zod input schema. Committed inputs must stay small (ids, not blobs). */
	input: ZodSchema<Input>;
	/** Human/agent-readable description; surfaces in the manifest. */
	description?: string;
	/** Override default error presentation for this transition. */
	errorPolicy?: Partial<ErrorPolicy>;
	/** Local store write. Optimistic when the transition is committed. */
	apply?: (ctx: TransitionCtx<Store>, input: Input) => void;
	/** Server finalizer. Required for committed transitions. */
	serverAction?: (input: Input) => Promise<DullahanResult<Output>>;
	/** Alias for `serverAction` — HTTP/RPC finalizers in SPA or MFE apps. */
	remote?: (input: Input) => Promise<DullahanResult<Output>>;
	/** Rollback/compensation when the server rejects or throws. */
	onError?: (ctx: TransitionCtx<Store>, input: Input) => void;
	/** Runs after success (and after rollback on failure), e.g. cache invalidation. */
	onSettled?: (
		ctx: TransitionCtx<Store>,
		result: DullahanResult<Output> | null,
		input: Input
	) => void | Promise<void>;
};

/** Identity helper for inference + a single place to document the contract. */
export function defineTransition<
	Input,
	Output = void,
	Store extends object = object
>(def: TransitionDef<Input, Output, Store>): TransitionDef<Input, Output, Store> {
	return def;
}

export type TransitionManifestEntry = {
	name: string;
	tier: TransitionTier;
	description?: string;
};

export type TransitionRegistry<
	Store extends object,
	Defs extends Record<string, TransitionDef<any, any, Store>>
> = {
	execute<K extends keyof Defs & string>(
		name: K,
		input: unknown
	): Promise<
		DullahanResult<
			Defs[K] extends TransitionDef<any, infer O, Store> ? O | null : never
		>
	>;
	/** Enumerable manifest for command palettes, LLM tools, and audit logs. */
	list(): TransitionManifestEntry[];
	get<K extends keyof Defs & string>(name: K): Defs[K];
	ctx: TransitionCtx<Store>;
};

export type CreateTransitionRegistryConfig<
	Store extends object,
	Defs extends Record<string, TransitionDef<any, any, Store>>
> = {
	store: StoreApi<Store>;
	transitions: Defs;
	query?: QueryPort;
};

export function createTransitionRegistry<
	Store extends object,
	Defs extends Record<string, TransitionDef<any, any, Store>>
>(
	config: CreateTransitionRegistryConfig<Store, Defs>
): TransitionRegistry<Store, Defs> {
	const ctx: TransitionCtx<Store> = {
		store: config.store,
		query: config.query ?? noopQueryPort
	};

	for (const def of Object.values(config.transitions)) {
		if (def.tier === "committed" && !def.serverAction && !def.remote) {
			if (typeof console !== "undefined") {
				console.warn(
					`[dullahan-web] Transition "${def.name}" is committed but has no ` +
						`serverAction/remote — it will apply locally without server finalization.`
				);
			}
		}
	}

	const execute = async (
		name: string,
		rawInput: unknown
	): Promise<DullahanResult<unknown>> => {
		const def =
			config.transitions[name] ??
			Object.values(config.transitions).find((entry) => entry.name === name);
		const known = assertKnownTransition(name, Boolean(def));
		if (!known.ok) {
			return known;
		}

		const policyOverride = def!.errorPolicy;
		const parsed = parseTransitionInput(def!.input, rawInput, name, {
			policy: policyOverride
		});
		if (!parsed.ok) {
			return parsed;
		}
		const input = parsed.data;

		if (def!.apply) {
			const applied = runTransitionApply(
				() => def!.apply!(ctx, input),
				name,
				{ policy: policyOverride }
			);
			if (!applied.ok) {
				return applied;
			}
		}

		let serverResult: DullahanResult<unknown> | null = null;

		const finalize = def!.serverAction ?? def!.remote;

		if (finalize) {
			try {
				serverResult = await finalize(input);
			} catch (error) {
				serverResult = {
					ok: false,
					error: errorFromThrown(error, "transition.server", "REMOTE_THROW")
				};
			}

			if (!serverResult.ok) {
				def!.onError?.(ctx, input);
				await def!.onSettled?.(ctx, serverResult, input);
				return resolveServerActionResult(serverResult, name, {
					policy: policyOverride
				});
			}
		}

		await def!.onSettled?.(ctx, serverResult, input);

		return ok(
			serverResult && serverResult.ok ? serverResult.data : null
		);
	};

	return {
		execute: execute as TransitionRegistry<Store, Defs>["execute"],
		list: () =>
			Object.values(config.transitions).map((def) => ({
				name: def.name,
				tier: def.tier,
				description: def.description
			})),
		get: (name) => config.transitions[name],
		ctx
	};
}
