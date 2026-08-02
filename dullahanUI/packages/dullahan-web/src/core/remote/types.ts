import type { DullahanResult } from "../errors/types";

/** Boundary handler for Next.js server actions — accepts unvalidated wire input. */
export type ValidatedHandler<Output> = (
	rawInput: unknown
) => Promise<DullahanResult<Output>>;

/** Registry finalizer after transition input validation (Server Action, HTTP, RPC). */
export type RemoteHandler<Input, Output> = (
	input: Input
) => Promise<DullahanResult<Output>>;

/** Standard wire envelope for HTTP/RPC backends. */
export type WireResult<T> = DullahanResult<T>;
