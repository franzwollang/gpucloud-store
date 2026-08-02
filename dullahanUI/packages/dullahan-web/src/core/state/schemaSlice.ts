import type { z } from 'zod';

/**
 * Temporary stand-in: upstream schemaSlice also defines defineSchemaSlice and
 * pulls in store/composable. We only need the Zod type alias for the contact
 * page/server slice — restore the full module when swapping to real dullahan-web.
 */
export type ZodSchema<T = unknown> = z.ZodType<T>;
