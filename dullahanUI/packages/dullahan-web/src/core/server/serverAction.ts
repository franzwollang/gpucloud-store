import type { z } from "zod";

import type { ValidatedHandler } from "../remote/types";
import { createValidatedHandler } from "../remote/validatedHandler";

/**
 * Wraps a server-side handler with Zod validation and structured
 * `DullahanResult` errors. For Next.js, export from a `'use server'` module.
 * For transport-agnostic handlers, prefer `createValidatedHandler` from `dullahan-web/remote`.
 */
export function createServerAction<S extends z.ZodType, Output>(
	schema: S,
	handler: (input: z.infer<S>) => Promise<Output> | Output
): ValidatedHandler<Output> {
	return createValidatedHandler(schema, handler);
}
