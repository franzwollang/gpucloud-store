import type { ZodSchema } from "../state/schemaSlice";
import { fieldErrors, sanitizeForUser, toUserMessage } from "./format";
import {
	domainError,
	errorFromThrown,
	fail,
	internalError,
	issuesFromZod,
	ok
} from "./kinds";
import { errorPolicies, mergePolicyWithKind, resolvePolicy } from "./policy";
import type { ErrorPolicy } from "./policy";
import { presentError } from "./present";
import type {
	DullahanResult,
	ErrorContext,
	ErrorRuntime
} from "./types";

function runtimeDefault(): ErrorRuntime {
	if (typeof window !== "undefined") return "client";
	return "server";
}

function makeCtx(
	concern: ErrorContext["concern"],
	id?: string,
	runtime?: ErrorRuntime
): ErrorContext {
	return { concern, id, runtime: runtime ?? runtimeDefault() };
}

export function parseTransitionInput<Input>(
	schema: ZodSchema<Input>,
	raw: unknown,
	transitionName: string,
	opts?: { policy?: Partial<ErrorPolicy>; runtime?: ErrorRuntime }
): DullahanResult<Input> {
	const context = makeCtx("transition.input", transitionName, opts?.runtime);
	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		const error = { kind: "validation" as const, issues: issuesFromZod(parsed.error) };
		const policy = resolvePolicy(
			errorPolicies.transition.input(transitionName),
			opts?.policy
		);
		presentError(error, context, policy);
		return fail(error, context);
	}
	return ok(parsed.data);
}

export function runTransitionApply(
	fn: () => void,
	transitionName: string,
	opts?: { policy?: Partial<ErrorPolicy>; runtime?: ErrorRuntime }
): DullahanResult<void> {
	const context = makeCtx("transition.apply", transitionName, opts?.runtime);
	try {
		fn();
		return ok(undefined);
	} catch (err) {
		const error = errorFromThrown(err, "transition.apply", "APPLY_THROW");
		const policy = resolvePolicy(
			errorPolicies.transition.apply(),
			opts?.policy
		);
		presentError(error, context, policy);
		return fail(error, context);
	}
}

export function resolveServerActionResult<Output>(
	result: DullahanResult<Output>,
	transitionName: string,
	opts?: { policy?: Partial<ErrorPolicy>; runtime?: ErrorRuntime }
): DullahanResult<Output> {
	if (result.ok) {
		return result;
	}

	const context = makeCtx("transition.server", transitionName, opts?.runtime);
	const basePolicy = errorPolicies.transition.server(result.error.kind);
	const policy = mergePolicyWithKind(
		resolvePolicy(basePolicy, opts?.policy),
		result.error.kind,
		"transition.server"
	);
	presentError(result.error, context, policy);
	return { ok: false, error: result.error, context };
}

export function assertKnownTransition(
	name: string,
	known: boolean
): DullahanResult<void> {
	if (known) {
		return ok(undefined);
	}

	const error = internalError(
		"UNKNOWN_TRANSITION",
		new Error(`Unknown transition "${name}"`),
		{ message: `Unknown transition "${name}"` }
	);
	const context = makeCtx("wiring.registry", name);
	const policy = errorPolicies.wiring.registry();
	presentError(error, context, policy);

	if (policy.disposition === "throw") {
		throw new Error(error.message);
	}

	return fail(error, context);
}

export function parseRehydratedSlice<T extends Record<string, unknown>>(
	schema: ZodSchema<T>,
	raw: unknown,
	namespace: string,
	opts?: { runtime?: ErrorRuntime }
): Partial<T> | null {
	const parsed = schema.safeParse(raw);
	if (parsed.success) {
		return parsed.data;
	}

	const error = { kind: "validation" as const, issues: issuesFromZod(parsed.error) };
	const context = makeCtx("persist.rehydrate", namespace, opts?.runtime);
	presentError(error, context, errorPolicies.persist.rehydrate(namespace));
	return null;
}

export function parseCookieHint<T extends Record<string, unknown>>(
	schema: ZodSchema<T>,
	raw: unknown,
	namespace: string,
	opts?: { runtime?: ErrorRuntime }
): Partial<T> | null {
	if (raw == null) {
		return null;
	}

	let candidate: unknown = raw;
	if (typeof raw === "string") {
		try {
			candidate = JSON.parse(raw);
		} catch {
			const error = {
				kind: "validation" as const,
				issues: [
					{ code: "invalid_json", path: [], message: "Invalid cookie JSON" }
				]
			};
			presentError(
				error,
				makeCtx("cookie.hint", namespace, opts?.runtime),
				errorPolicies.cookie.hint(namespace)
			);
			return null;
		}
	}

	const data =
		typeof candidate === "object" &&
		candidate !== null &&
		"state" in candidate
			? (candidate as { state: unknown }).state
			: candidate;

	const parsed = schema.safeParse(data);
	if (parsed.success) {
		return parsed.data;
	}

	const error = { kind: "validation" as const, issues: issuesFromZod(parsed.error) };
	presentError(
		error,
		makeCtx("cookie.hint", namespace, opts?.runtime),
		errorPolicies.cookie.hint(namespace)
	);
	return null;
}

export function parsePageSnapshot<T extends Record<string, unknown>>(
	schema: ZodSchema<T>,
	raw: unknown,
	scopeId: string,
	initial: T,
	opts?: { runtime?: ErrorRuntime }
): T {
	const partial =
		typeof raw === "object" && raw !== null
			? (raw as Record<string, unknown>)
			: {};
	const candidate = { ...initial, ...partial };
	const parsed = schema.safeParse(candidate);

	if (parsed.success) {
		return parsed.data;
	}

	const error = { kind: "validation" as const, issues: issuesFromZod(parsed.error) };
	presentError(
		error,
		makeCtx("page.snapshot", scopeId, opts?.runtime),
		errorPolicies.page.snapshot(scopeId)
	);
	return { ...initial };
}

export function reportWiringPort(
	method: string,
	opts?: { runtime?: ErrorRuntime }
): void {
	const error = internalError(
		"PORT_NOT_WIRED",
		new Error(`QueryPort.${method} requires a wired query client`),
		{
			message: `QueryPort.${method} called but no query client is wired. Pass a QueryPort to createTransitionRegistry.`
		}
	);
	presentError(
		error,
		makeCtx("wiring.port", method, opts?.runtime),
		errorPolicies.wiring.port()
	);
}

export function serverActionValidationFail(
	zodError: unknown
): DullahanResult<never> {
	return fail(
		{ kind: "validation", issues: issuesFromZod(zodError) },
		makeCtx("transition.server")
	);
}

export function serverActionThrown(
	err: unknown
): DullahanResult<never> {
	return fail(
		errorFromThrown(err, "transition.server"),
		makeCtx("transition.server")
	);
}

export function serverActionDomainFail(
	code: string,
	message: string
): DullahanResult<never> {
	return fail(domainError(code, message), makeCtx("transition.server"));
}

export { sanitizeForUser, toUserMessage, fieldErrors };
