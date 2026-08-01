'use server';

import { createServerAction } from 'dullahan-web';

import { contactSubmitInput } from '@/core/contact/schemas';

/**
 * PoC committed finalizer — validates lead payload and returns structured result.
 * Replace the stub with Prisma persist / CRM forward when ready.
 */
export const submitContactAction = createServerAction(
  contactSubmitInput,
  async input => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[contact.submit]', {
        email: input.email,
        planItemCount: input.planItems.length
      });
    }

    return {
      submittedAt: new Date().toISOString(),
      email: input.email
    };
  }
);
