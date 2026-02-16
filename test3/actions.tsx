export async function handleAtlasFormSubmit(
  submissionState: QuerySubmissionState,
  formState: z.infer<typeof queryFormSchema>
): Promise<QuerySubmissionState> {
  try {
    const parsedData = queryFormSchema
      // to target the form root for errors, use "root" as the path
      // .superRefine((arg, ctx) => {
      //   ctx.addIssue({
      //     code: 'custom',
      //     message: 'Example server error (about)',
      //     path: ['about']
      //   });
      // })
      // .superRefine((arg, ctx) => {
      //   ctx.addIssue({
      //     code: 'custom',
      //     message: 'Example server error (about query)',
      //     path: ['about', 0, 'query']
      //   });
      // })
      // .superRefine((arg, ctx) => {
      //   ctx.addIssue({
      //     code: 'custom',
      //     message: 'Example server error (global)',
      //     path: ['root']
      //   });
      // })
      .safeParse(formState);

    if (!parsedData.success) {
      console.log('parsedData.error: ', parsedData.error);

      return {
        intent: 'error',
        origin: 'server',
        data: null,
        validationErrors: parsedData.error.issues,
        error: null
      };
    }

    return {
      intent: 'success',
      origin: 'server',
      data: null, // response.data,
      validationErrors: null,
      error: null
    };
  } catch (error) {
    // generic error
    console.error('submitQueryForm error: ', error);
    return {
      intent: 'error',
      origin: 'server',
      data: null,
      validationErrors: null,
      error: null
    };
  }
}
