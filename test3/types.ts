import { z, ZodError } from 'zod';

export type SubmissionState<
  DATA extends Record<string, any>,
  VALIDATION_ERRORS
> =
  | {
      intent: 'idle';
      origin: 'client';
      data: null;
      validationErrors: null;
      error: null;
    }
  | {
      intent: 'pending';
      origin: 'client';
      data: DATA;
      validationErrors: null;
      error: null;
    }
  | {
      intent: 'error';
      origin: 'client' | 'server';
      data: null;
      validationErrors: VALIDATION_ERRORS | null;
      error: string | null;
    }
  | {
      intent: 'success';
      origin: 'server';
      data: DATA | null;
      validationErrors: VALIDATION_ERRORS | null;
      error: string | null;
    };

export const queryFormSchema = z.object({
  example: z.string(),
  example2: z
    .number()
    .min(1, 'Example2 must be greater than 0')
    .max(100, 'Example2 must be less than 100'),
  example3: z.boolean(),
  example4: z.array(z.string()),
  example5: z.object({
    example6: z.string(),
    example7: z.number()
  })
});

export type QuerySubmissionState = SubmissionState<
  z.infer<typeof queryFormSchema>,
  ZodError['issues']
>;

export type QueryFormSubmitHandler = (
  prevState: QuerySubmissionState,
  formState: z.infer<typeof queryFormSchema>
) => Promise<QuerySubmissionState>;
