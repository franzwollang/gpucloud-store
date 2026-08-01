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

export const contactSubmitInput = z
  .object({
    name: z.string().min(1),
    company: z.string().optional(),
    email: z.string().email(),
    role: z.string().optional(),
    message: z.string().optional(),
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
