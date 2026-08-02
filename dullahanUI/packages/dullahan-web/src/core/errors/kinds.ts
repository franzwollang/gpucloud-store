import { ZodError } from "zod";

import type {
	DullahanError,
	ErrorConcern,
	InternalError,
	NetworkError,
	NetworkErrorCode,
	ValidationIssue
} from "./types";

export function validationError(issues: ValidationIssue[]) {
	return { kind: "validation" as const, issues };
}

export function domainError(
	code: string,
	message: string,
	opts?: {
		path?: readonly (string | number)[];
		details?: Record<string, unknown>;
	}
) {
	return {
		kind: "domain" as const,
		code,
		message,
		...(opts?.path !== undefined ? { path: opts.path } : {}),
		...(opts?.details !== undefined ? { details: opts.details } : {})
	};
}

export function networkError(
	code: NetworkErrorCode,
	message: string,
	opts?: { status?: number; retryable?: boolean }
): NetworkError {
	return {
		kind: "network",
		code,
		message,
		...(opts?.status !== undefined ? { status: opts.status } : {}),
		...(opts?.retryable !== undefined ? { retryable: opts.retryable } : {})
	};
}

export function internalError(
	code: string,
	err: unknown,
	opts?: { message?: string }
): InternalError {
	const message =
		opts?.message ??
		(err instanceof Error ? err.message : String(err));
	const stack = err instanceof Error ? err.stack : undefined;
	return {
		kind: "internal",
		code,
		message,
		...(stack !== undefined && isDev() ? { stack } : {})
	};
}

export function issuesFromZod(error: ZodError | unknown): ValidationIssue[] {
	if (error instanceof ZodError) {
		return error.issues.map(normalizeIssue);
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"issues" in error &&
		Array.isArray((error as { issues: unknown }).issues)
	) {
		return (error as { issues: unknown[] }).issues.map(normalizeIssue);
	}
	return [
		{
			code: "custom",
			path: [],
			message: error instanceof Error ? error.message : String(error)
		}
	];
}

function normalizeIssue(raw: unknown): ValidationIssue {
	if (typeof raw !== "object" || raw === null) {
		return { code: "custom", path: [], message: String(raw) };
	}
	const issue = raw as Record<string, unknown>;
	return {
		code: typeof issue.code === "string" ? issue.code : "custom",
		path: Array.isArray(issue.path)
			? (issue.path as (string | number)[])
			: [],
		message: typeof issue.message === "string" ? issue.message : "Invalid",
		...(typeof issue.params === "object" &&
		issue.params !== null &&
		!Array.isArray(issue.params)
			? { params: issue.params as Record<string, unknown> }
			: {})
	};
}

export function errorFromThrown(
	err: unknown,
	concern: ErrorConcern,
	code = "THROWN"
): DullahanError {
	if (
		typeof err === "object" &&
		err !== null &&
		"kind" in err &&
		typeof (err as { kind: unknown }).kind === "string"
	) {
		return err as DullahanError;
	}

	if (concern === "fetch.query") {
		return networkError("fetch_failed", err instanceof Error ? err.message : String(err), {
			retryable: true
		});
	}

	return internalError(code, err);
}

function isDev(): boolean {
	const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
		.process;
	return proc?.env?.NODE_ENV !== "production";
}

export function ok<T>(data: T) {
	return { ok: true as const, data };
}

export function fail(
	error: DullahanError,
	context?: import("./types").ErrorContext
) {
	return { ok: false as const, error, context };
}
