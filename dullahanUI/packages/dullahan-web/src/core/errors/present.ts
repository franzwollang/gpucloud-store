import { fieldErrors, sanitizeForUser, toUserMessage } from "./format";
import type { ErrorPolicy, PresentChannel } from "./policy";
import type { DullahanError, ErrorContext, ErrorRuntime } from "./types";

export type ErrorPresentationHandlers = {
	toast?: (message: string, opts?: { retryable?: boolean }) => void;
	modal?: (message: string) => void;
	inline?: (scope: string, fieldErrors: Record<string, string>) => void;
	telemetry?: (error: DullahanError, context: ErrorContext) => void;
	transitionHook?: (error: DullahanError) => void;
};

let handlers: ErrorPresentationHandlers = {};

export function configureErrorPresentation(
	next: ErrorPresentationHandlers
): void {
	handlers = { ...handlers, ...next };
}

export function resetErrorPresentation(): void {
	handlers = {};
}

export function getTransitionHookHandler():
	| ((error: DullahanError) => void)
	| undefined {
	return handlers.transitionHook;
}

function isDev(): boolean {
	const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
		.process;
	return proc?.env?.NODE_ENV !== "production";
}

function isClientRuntime(runtime?: ErrorRuntime): boolean {
	return runtime === "client" || runtime === undefined;
}

function isServerRuntime(runtime?: ErrorRuntime): boolean {
	return runtime === "server" || runtime === "rsc";
}

function logToConsole(
	level: "warn" | "error",
	message: string,
	error: DullahanError,
	context: ErrorContext
) {
	if (typeof console === "undefined") return;
	const payload = { error, context };
	if (level === "warn") {
		console.warn(`[dullahan-web] ${message}`, payload);
	} else {
		console.error(`[dullahan-web] ${message}`, payload);
	}
}

function dispatchChannel(
	channel: PresentChannel,
	error: DullahanError,
	context: ErrorContext,
	sanitize: boolean
): void {
	const presented = sanitize ? sanitizeForUser(error) : error;

	switch (channel.type) {
		case "dev-console":
			if (isDev()) {
				logToConsole(channel.level, context.concern, presented, context);
			}
			break;
		case "client-console":
			logToConsole(channel.level, context.concern, presented, context);
			break;
		case "server-log":
			if (isServerRuntime(context.runtime)) {
				logToConsole(channel.level, context.concern, presented, context);
			}
			break;
		case "telemetry":
			handlers.telemetry?.(presented, context);
			break;
		case "inline":
			if (isClientRuntime(context.runtime)) {
				handlers.inline?.(channel.scope, fieldErrors(presented));
			}
			break;
		case "transition-hook":
			if (isClientRuntime(context.runtime)) {
				handlers.transitionHook?.(presented);
			}
			break;
		case "toast":
			if (isClientRuntime(context.runtime)) {
				handlers.toast?.(toUserMessage(presented), {
					retryable:
						presented.kind === "network" ? presented.retryable : undefined
				});
			}
			break;
		case "modal":
			if (isClientRuntime(context.runtime)) {
				handlers.modal?.(toUserMessage(presented));
			}
			break;
	}
}

function deferUi(fn: () => void) {
	if (typeof queueMicrotask === "function") {
		queueMicrotask(fn);
	} else {
		fn();
	}
}

export function presentError(
	error: DullahanError,
	context: ErrorContext,
	policy: ErrorPolicy
): void {
	if (policy.disposition === "silent") {
		const devOnly = policy.present.filter((c) => c.type === "dev-console");
		for (const channel of devOnly) {
			dispatchChannel(channel, error, context, false);
		}
		return;
	}

	const run = () => {
		for (const channel of policy.present) {
			dispatchChannel(
				channel,
				error,
				context,
				policy.sanitize !== false
			);
		}
	};

	const hasUiChannel = policy.present.some((c) =>
		["toast", "modal", "inline", "transition-hook"].includes(c.type)
	);

	if (hasUiChannel) {
		deferUi(run);
	} else {
		run();
	}

	if (policy.disposition === "throw" && isDev()) {
		throw error instanceof Error ? error : new Error(toUserMessage(error));
	}
}
