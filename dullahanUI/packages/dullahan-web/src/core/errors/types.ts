export type ValidationIssue = {
	code: string;
	path: readonly (string | number)[];
	message: string;
	params?: Record<string, unknown>;
};

export type ValidationError = {
	kind: "validation";
	issues: ValidationIssue[];
};

export type DomainError = {
	kind: "domain";
	code: string;
	message: string;
	path?: readonly (string | number)[];
	details?: Record<string, unknown>;
};

export type NetworkErrorCode =
	| "offline"
	| "timeout"
	| "aborted"
	| "fetch_failed"
	| "server_error";

export type NetworkError = {
	kind: "network";
	code: NetworkErrorCode;
	message: string;
	status?: number;
	retryable?: boolean;
};

export type InternalError = {
	kind: "internal";
	code: string;
	message: string;
	stack?: string;
};

export type DullahanError =
	| ValidationError
	| DomainError
	| NetworkError
	| InternalError;

export type ErrorConcern =
	| "transition.input"
	| "transition.apply"
	| "transition.server"
	| "persist.rehydrate"
	| "cookie.hint"
	| "page.snapshot"
	| "fetch.query"
	| "wiring.registry"
	| "wiring.port";

export type ErrorRuntime = "client" | "server" | "rsc";

export type ErrorContext = {
	concern: ErrorConcern;
	id?: string;
	runtime?: ErrorRuntime;
};

export type DullahanResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: DullahanError; context?: ErrorContext };
