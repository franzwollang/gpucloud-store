import type { z } from "zod";

import { ok } from "../errors/kinds";
import {
	serverActionDomainFail,
	serverActionThrown,
	serverActionValidationFail
} from "../errors/parse";
import type { ValidatedHandler } from "./types";

/**
 * Transport-agnostic validated handler. Use inside Next.js `'use server'` modules,
 * FastAPI clients, or any runtime — validation and `DullahanResult` shape are identical.
 */
export function createValidatedHandler<S extends z.ZodType, Output>(
	schema: S,
	handler: (input: z.infer<S>) => Promise<Output> | Output
): ValidatedHandler<Output> {
	return async (rawInput) => {
		const parsed = schema.safeParse(rawInput);
		if (!parsed.success) {
			return serverActionValidationFail(parsed.error);
		}

		try {
			const data = await handler(parsed.data);
			return ok(data);
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				"message" in error
			) {
				const domain = error as { code: string; message: string };
				return serverActionDomainFail(domain.code, domain.message);
			}
			return serverActionThrown(error);
		}
	};
}
