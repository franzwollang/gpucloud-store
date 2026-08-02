import type { DullahanError, ValidationIssue } from "./types";

function isProduction(): boolean {
	const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
		.process;
	return proc?.env?.NODE_ENV === "production";
}

export function sanitizeForUser(error: DullahanError): DullahanError {
	if (!isProduction()) {
		return error;
	}

	switch (error.kind) {
		case "validation":
			return error;
		case "domain":
			return {
				kind: "domain",
				code: error.code,
				message: error.message,
				...(error.path !== undefined ? { path: error.path } : {})
			};
		case "network":
			return {
				kind: "network",
				code: error.code,
				message: error.message,
				retryable: error.retryable,
				...(error.status !== undefined ? { status: error.status } : {})
			};
		case "internal":
			return {
				kind: "internal",
				code: error.code,
				message: "Something went wrong"
			};
	}
}

export function toUserMessage(error: DullahanError): string {
	const sanitized = sanitizeForUser(error);
	switch (sanitized.kind) {
		case "validation":
			return sanitized.issues[0]?.message ?? "Validation failed";
		case "domain":
		case "network":
		case "internal":
			return sanitized.message;
	}
}

export function fieldErrors(error: DullahanError): Record<string, string> {
	if (error.kind !== "validation") {
		return {};
	}

	const result: Record<string, string> = {};
	for (const issue of error.issues) {
		const key =
			issue.path.length > 0 ? issue.path.map(String).join(".") : "_root";
		if (!result[key]) {
			result[key] = issue.message;
		}
	}
	return result;
}

export function pathKey(path: readonly (string | number)[]): string {
	return path.length > 0 ? path.map(String).join(".") : "_root";
}

export function issuesToFieldMap(issues: ValidationIssue[]): Record<string, string> {
	return fieldErrors({ kind: "validation", issues });
}
