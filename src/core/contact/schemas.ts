import { z } from 'zod';

export const planItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  specs: z.string(),
  price: z.string(),
  details: z.string(),
  quantity: z.number(),
  gpuModel: z.string().optional(),
  gpuCount: z.number().optional(),
  region: z.string().optional(),
  provider: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      location: z.string().optional()
    })
    .optional()
});

const contactFieldsShape = {
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  role: z.string().optional(),
  message: z.string().optional()
};

/** Shared submit contract for human UI and agent/tool calls. */
export const contactSubmitInput = z
  .object({
    ...contactFieldsShape,
    planItems: z.array(planItemSchema)
  })
  .refine(
    data => {
      const hasConfigs = data.planItems.length > 0;
      const hasMessage = Boolean(data.message?.trim());
      return hasConfigs || hasMessage;
    },
    { message: 'Provide a message or at least one plan configuration', path: ['message'] }
  );

export type ContactSubmitInput = z.infer<typeof contactSubmitInput>;

export type ContactFormValidationMessages = {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageOrConfigs: string;
};

/**
 * Client RHF schema: same rules as `contactSubmitInput`, with i18n messages.
 * Plan items stay in Zustand and are attached at submit time.
 * Pass a getter so refine stays correct when the plan store changes without
 * recreating the RHF resolver.
 */
export function createContactFormSchema(
  getPlanItemCount: () => number,
  messages: ContactFormValidationMessages
) {
  return z
    .object({
      name: z.string().min(1, messages.nameRequired),
      company: z.string().optional(),
      email: z
        .string()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      role: z.string().optional(),
      message: z.string().optional()
    })
    .refine(
      data => getPlanItemCount() > 0 || Boolean(data.message?.trim()),
      {
        message: messages.messageOrConfigs,
        path: ['message']
      }
    );
}

export type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>;
