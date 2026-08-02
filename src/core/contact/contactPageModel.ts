'use client';

import {
  defineClientPageModel,
  defineHydratedScope,
  definePageTransition
} from 'dullahan-web/client';
import { z } from 'zod';

import { submitContactAction } from '@/server/actions/submitContact';

import { contactSubmitInput } from '@/core/contact/schemas';

const contactUiScope = defineHydratedScope({
  profile: 'page-ui',
  schema: z.object({
    lastSubmittedEmail: z.string().nullable().default(null)
  })
});

export const contactPageModel = defineClientPageModel({
  clientOnly: { scope: contactUiScope },
  transitions: {
    submit: definePageTransition({
      name: 'contact.submit',
      tier: 'committed',
      input: contactSubmitInput,
      apply: (
        { setClient }: { setClient: (patch: { lastSubmittedEmail: string | null }) => void },
        { email }: { email: string }
      ) => setClient({ lastSubmittedEmail: email }),
      serverAction: submitContactAction,
      onError: ({
        setClient
      }: {
        setClient: (patch: { lastSubmittedEmail: string | null }) => void;
      }) => setClient({ lastSubmittedEmail: null })
    })
  }
});
