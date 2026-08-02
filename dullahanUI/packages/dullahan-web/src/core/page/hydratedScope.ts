import { parsePageSnapshot } from "../errors/parse";
import type { ZodSchema } from "../state/schemaSlice";
import {
	resolveProfile,
	type SliceMeta,
	type SliceProfileName,
	type SliceProfileSpec
} from "../state/profiles";

/** JSON-safe values (RSC hydration + cookie/localStorage persistence). */
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

/** RSC-serializable but not assumed JSON-persistable without custom encoding. */
export type RscValue =
	| JsonValue
	| Date
	| Map<unknown, unknown>
	| Set<unknown>
	| undefined;

function pick<T extends object>(
	source: T,
	keys: ReadonlyArray<string>
): Partial<T> {
	const result: Record<string, unknown> = {};
	for (const key of keys) {
		if (key in source) {
			result[key] = (source as Record<string, unknown>)[key];
		}
	}
	return result as Partial<T>;
}

export type HydratedScopeDef<T extends Record<string, unknown>> = {
	readonly kind: "zod";
	meta: SliceMeta;
	schema: ZodSchema<T>;
	build: () => T;
	/** Parse an RSC snapshot subset; invalid keys fall back to schema defaults. */
	parse: (raw: unknown) => T;
	extractJson: (state: T) => Record<string, JsonValue>;
	persistKeys: ReadonlyArray<string>;
	rscKeys: ReadonlyArray<string>;
	version?: number;
	minSupportedVersion?: number;
	migrate?: (raw: unknown, fromVersion: number) => unknown;
};

export type AnyHydratedScope = HydratedScopeDef<any>;

/** Infer the runtime state shape from a hydrated scope definition. */
export type StateOfScope<S extends AnyHydratedScope> =
	S extends HydratedScopeDef<infer T extends Record<string, unknown>>
		? T
		: S extends { readonly kind: "zod"; build: () => infer Built }
			? Built & Record<string, unknown>
			: Record<string, unknown>;

/** Shared scope omitted → empty shared state. */
export type SharedStateOf<S extends AnyHydratedScope | undefined> =
	S extends AnyHydratedScope ? StateOfScope<S> : Record<string, never>;

export type DefineHydratedScopeConfig<T extends Record<string, unknown>> = {
	profile: SliceProfileName;
	schema: ZodSchema<T>;
	initial?: T;
	rscKeys?: ReadonlyArray<keyof T & string>;
	persistKeys?: ReadonlyArray<keyof T & string>;
	version?: number;
	minSupportedVersion?: number;
	migrate?: (raw: unknown, fromVersion: number) => unknown;
	profileOverrides?: Partial<SliceProfileSpec>;
};

/**
 * Define a hydrated page scope (shared or clientOnly) from a Zod schema.
 * Transport metadata, persist keys, and snapshot parsing are all derived.
 */
export function defineHydratedScope<T extends Record<string, unknown>>(
	config: DefineHydratedScopeConfig<T>
): HydratedScopeDef<T> {
	const meta = resolveProfile(config.profile, config.profileOverrides);
	const initial = config.initial ?? config.schema.parse({});
	const schemaKeys = Object.keys(initial) as Array<keyof T & string>;
	const rscKeys = config.rscKeys ?? [];
	const rscSet = new Set<string>(rscKeys);
	const persistKeys =
		config.persistKeys ?? schemaKeys.filter((key) => !rscSet.has(key));

	const parse = (raw: unknown): T => {
		const partial =
			typeof raw === "object" && raw !== null
				? (raw as Record<string, unknown>)
				: {};
		const candidate = { ...initial, ...pick(partial as T, schemaKeys) };
		return parsePageSnapshot(
			config.schema,
			candidate,
			config.profile,
			initial
		);
	};

	return {
		kind: "zod",
		meta,
		schema: config.schema,
		build: () => ({ ...initial }),
		parse,
		extractJson: (state) => pick(state, persistKeys) as Record<string, JsonValue>,
		persistKeys,
		rscKeys,
		version: config.version,
		minSupportedVersion: config.minSupportedVersion,
		migrate: config.migrate
	};
}

export function buildScopeState(scope: AnyHydratedScope | undefined): object {
	if (!scope) return {};
	return scope.build();
}

export function parseScopeSnapshot(
	scope: AnyHydratedScope | undefined,
	raw: unknown
): object {
	if (!scope) return {};
	return scope.parse(raw);
}

export function extractScopeJson(
	scope: AnyHydratedScope | undefined,
	state: object
): Record<string, JsonValue> {
	if (!scope) return {};
	return scope.extractJson(state as Record<string, unknown>);
}
