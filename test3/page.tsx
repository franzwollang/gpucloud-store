import { Form } from 'react-hook-form';

import type { QuerySubmissionState } from './types';

const initialSubmissionState: QuerySubmissionState = {
  intent: 'idle',
  origin: 'client',
  data: null,
  validationErrors: null,
  error: null
};

export default function QueryForm() {
  const queryClient = useQueryClient();

  const rhForm = useForm<z.infer<typeof queryFormSchema>>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: formValues,
    reValidateMode: 'onChange',
    mode: 'onChange',
    shouldFocusError: true
  });

  useEffect(() => {
    if (rhForm) setRHForm(rhForm);
  }, [setRHForm, rhForm]);

  const { errors } = useRHFormState(rhForm);

  const [submissionState, submissionAction] = useServerAction(
    handleAtlasFormSubmit,
    initialSubmissionState
  );

  const areServerValidationErrors =
    submissionState.intent === 'error' &&
    submissionState.origin === 'server' &&
    submissionState.validationErrors;

  useEffect(() => {
    for (const zodIssue of submissionState.validationErrors ?? []) {
      type ErrorPathsUnion = Parameters<(typeof rhForm)['setError']>[0];
      const name = zodIssue.path
        .map(element => String(element))
        .join('.') as ErrorPathsUnion;
      const errorDetails = zodIssue.message;
      rhForm.setError(name, { message: errorDetails });
    }
  }, [areServerValidationErrors]);

  const aboutError = errors['about']?.root?.message;
  const aboutArrayErrors = infoCategories.reduce((acc, category) => {
    const categoryErrors = errors['about']
      ? errors['about'][category.label]!
      : null;
    return [
      ...acc,
      ...(categoryErrors?.root?.message ? [categoryErrors?.root?.message] : [])
    ];
  }, [] as string[]);
  const aboutErrors = aboutError
    ? [aboutError, ...aboutArrayErrors]
    : [...aboutArrayErrors];
  const industryError = errors['options']?.industry?.message;
  const industryErrors = industryError ? [industryError] : [];
  // const educationStatusError = errors['options']?.educationStatus?.message;
  // const educationStatusErrors = educationStatusError
  //   ? [educationStatusError]
  //   : [];
  // const careerStepError = errors['options']?.careerStep?.message;
  // const careerStepErrors = careerStepError ? [careerStepError] : [];

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = { ...rhForm.getValues() };

    rhForm.handleSubmit(async (_data: z.infer<typeof queryFormSchema>) => {
      const submission = submissionAction(submissionState, data).then(
        submissionState => {
          if (submissionState.intent === 'success') {
            if (!eagerlyFetchEmbeddings) {
              const aboutFields = rhForm.getValues('about');

              console.log('onSubmit aboutFields: ', aboutFields);

              const queryOptions = Object.entries(aboutFields).reduce(
                (acc, [categoryLabel, fields]) => {
                  return [
                    ...acc,
                    ...fields.map(({ query: text }) => ({
                      ...sharedQueryOptions,
                      queryKey: ['embeddings', 'about', categoryLabel, text],
                      queryFn: async () => {
                        const embedding = await getEmbedding(text);
                        return { id: uuid(), embedding };
                      },
                      enabled:
                        text.replaceAll(
                          /[\s\r\n\d]|[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]/g,
                          ''
                        ).length > 0
                    }))
                  ];
                },
                [] as UseQueryOptions<{
                  id: string;
                  embedding: Array<number>;
                }>[]
              );

              setControlledQueryOptions(queryOptions);
            } else {
              const embeddings = Object.values(embeddingsQueries)
                .flat()
                .map(query => query.data) as {
                id: string;
                embedding: number[];
              }[];

              setEmbeddings(embeddings);
            }

            queryClient.invalidateQueries({ queryKey: ['rankedMatched'] });

            router.push(`${pathname}?mobile-view=results`);
          }
        }
      );

      await submission;
    })(event);
  }

  return (
    <>
      <Form {...rhForm}>
        <form
          ref={formScrollRef}
          onSubmit={onSubmit}
          className={cn(
            'flex h-full w-full flex-col',
            format === 'mobile' && 'px-1',
            format === 'desktop' &&
              'mt-2 mr-4 w-[40%] max-w-[600px] snap-y overflow-x-hidden overflow-y-scroll scroll-smooth'
          )}
        ></form>
      </Form>
    </>
  );
}
