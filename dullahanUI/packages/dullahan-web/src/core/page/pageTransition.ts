import type {
	DullahanResult,
	TransitionCtx,
	TransitionDef
} from "../registry/registry";
import { defineTransition } from "../registry/registry";
import {
	createPageTransitionCtx,
	type PageScopeKeys,
	type PageTransitionCtx
} from "./pageTransitionCtx";

type PlainState = Record<string, unknown>;

export type PageTransitionDef<
	Input,
	Output = void,
	Store extends PlainState = PlainState
> = Omit<
	TransitionDef<Input, Output, Store>,
	"apply" | "onError" | "onSettled"
> & {
	apply?: (ctx: PageTransitionCtx<Store>, input: Input) => void;
	onError?: (ctx: PageTransitionCtx<Store>, input: Input) => void;
	onSettled?: (
		ctx: PageTransitionCtx<Store>,
		result: DullahanResult<Output> | null,
		input: Input
	) => void | Promise<void>;
};

/** Define a page-scoped transition with scoped setShared/setClient in apply. */
export function definePageTransition<
	Input,
	Output = void,
	Store extends PlainState = PlainState
>(
	def: PageTransitionDef<Input, Output, Store>
): PageTransitionDef<Input, Output, Store> {
	return def;
}

export function adaptPageTransitionDefs<Store extends PlainState>(
	defs: Record<string, PageTransitionDef<any, any, Store>>,
	scopeKeys: PageScopeKeys,
	resolveQueryClient: () => ReturnType<
		typeof import("./globalQueryClient").getQueryClient
	>
): Record<string, TransitionDef<any, any, Store>> {
	const adapted: Record<string, TransitionDef<any, any, Store>> = {};

	for (const [key, def] of Object.entries(defs)) {
		const withPageCtx = <T>(
			fn:
				| ((ctx: PageTransitionCtx<Store>, input: T) => void | Promise<void>)
				| undefined
		) => {
			if (!fn) return undefined;
			return (baseCtx: TransitionCtx<Store>, input: T) => {
				const pageCtx = createPageTransitionCtx(
					baseCtx,
					scopeKeys,
					resolveQueryClient
				);
				return fn(pageCtx, input);
			};
		};

		adapted[key] = defineTransition({
			...def,
			apply: withPageCtx(def.apply),
			onError: withPageCtx(def.onError),
			onSettled: def.onSettled
				? (baseCtx, result, input) => {
						const pageCtx = createPageTransitionCtx(
							baseCtx,
							scopeKeys,
							resolveQueryClient
						);
						return def.onSettled!(pageCtx, result, input);
					}
				: undefined
		});
	}

	return adapted;
}
