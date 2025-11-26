'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSearch } from '@/components/ui/simple-search';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/style';
import type { CartItem } from '@/stores/cart';
import { useCartStore } from '@/stores/cart';

const createContactFormSchema = (
  items: CartItem[],
  validationMessages: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    messageOrConfigs: string;
  }
) =>
  z
    .object({
      name: z.string().min(1, validationMessages.nameRequired),
      company: z.string().optional(),
      email: z
        .string()
        .min(1, validationMessages.emailRequired)
        .email(validationMessages.emailInvalid),
      role: z.string().optional(),
      message: z.string().optional()
    })
    .refine(
      data => {
        const hasConfigs = items.length > 0;
        const hasMessage = data.message && data.message.trim().length > 0;
        return hasConfigs || hasMessage;
      },
      {
        message: validationMessages.messageOrConfigs,
        path: ['message']
      }
    );

type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>;

export function ContactWithCartForm() {
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const t = useTranslations('TEST.contactForm');
  const validation = useTranslations('TEST.contactForm.validation');
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const addItem = useCartStore(state => state.addItem);

  const validationMessages = {
    nameRequired: validation('nameRequired'),
    emailRequired: validation('emailRequired'),
    emailInvalid: validation('emailInvalid'),
    messageOrConfigs: validation('messageOrConfigs')
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(items, validationMessages))
  });

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus({ type: 'loading', message: '' });

    try {
      const payload = {
        name: data.name.trim(),
        company: data.company?.trim() ?? '',
        email: data.email.trim(),
        role: data.role?.trim() ?? '',
        message: data.message?.trim() ?? '',
        cartItems: items // Include cart items in submission
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormStatus({
          type: 'success',
          message: t('status.success')
        });
        reset();
      } else {
        let errorMessage = t('status.error');
        try {
          const responseData = (await response.json()) as { error?: string };
          if (responseData.error) errorMessage = responseData.error;
        } catch {
          // Use default error message
        }
        setFormStatus({ type: 'error', message: errorMessage });
      }
    } catch (err) {
      console.error(err);
      setFormStatus({
        type: 'error',
        message: t('status.networkError')
      });
    }
  };

  return (
    <div className="grid gap-7 lg:grid-cols-2">
      {/* Left side - Search + Cart items */}
      <div className="text-fg-soft">
        <div className="mb-6">
          <h3 className="text-fg-main mb-3 text-sm font-medium">
            {t('search.title')}
          </h3>
          <SimpleSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onAddToCart={addItem}
          />
        </div>

        {/* Cart items - always visible */}
        <div className="border-border/40 bg-bg-surface/50 rounded-lg border p-4">
          <h4 className="text-fg-main mb-1 text-sm font-medium">
            {t('selected.title', { count: items.length })}
          </h4>
          <p className="text-fg-muted mb-3 text-xs">{t('selected.subtitle')}</p>

          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="border-border/30 bg-bg-page/50 flex items-start justify-between gap-2 rounded border p-2"
                >
                  <div className="flex-1">
                    <div className="text-fg-main text-xs font-medium">
                      {item.title}
                    </div>
                    <div className="text-fg-muted mt-0.5 text-[10px]">
                      {t('selected.quantity', {
                        quantity: item.quantity,
                        price: item.price
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-fg-muted hover:text-fg-main rounded p-0.5 transition"
                    aria-label={t('selected.remove')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-fg-muted py-4 text-center text-xs">
              {t('selected.empty')}
            </p>
          )}

          <p className="text-fg-muted mt-3 text-xs">{t('selected.hint')}</p>
        </div>

        <div className="mt-6">
          <p className="text-fg-main mb-2 text-sm font-medium">
            {t('help.title')}
          </p>
          <ul className="mb-4 ml-4 space-y-1 text-sm">
            <li>{t('help.items.infrastructure')}</li>
            <li>{t('help.items.cluster')}</li>
            <li>{t('help.items.hybrid')}</li>
          </ul>

          <p className="text-fg-muted text-sm">{t('help.description')}</p>

          <p className="text-fg-muted text-sm">
            {t('help.emailIntro')}{' '}
            <a
              href={`mailto:${t('help.emailAddress')}`}
              className="text-ui-active-soft font-medium hover:underline"
            >
              {t('help.emailAddress')}
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-border/40 bg-bg-surface/50 rounded-2xl border p-5 shadow-lg"
      >
        <div className="mb-6 space-y-2">
          <h3 className="text-fg-main text-lg font-semibold">
            {t('form.title')}
          </h3>
          <p className="text-fg-soft text-sm">{t('form.subtitle')}</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="name"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.name')}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t('form.placeholders.name')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="company"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.company')}
            </Label>
            <Input
              id="company"
              type="text"
              placeholder={t('form.placeholders.company')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('company')}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="email"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form.placeholders.email')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-ui-danger mt-1 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="role"
              className="text-fg-soft mb-1.5 block text-xs font-medium"
            >
              {t('form.labels.role')}
            </Label>
            <Input
              id="role"
              type="text"
              placeholder={t('form.placeholders.role')}
              className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20"
              {...register('role')}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label
            htmlFor="message"
            className="text-fg-soft mb-1.5 block text-xs font-medium"
          >
            {t('form.labels.message')}
          </Label>
          <Textarea
            id="message"
            placeholder={t('form.placeholders.message')}
            className="border-border/50 bg-bg-page text-fg-main placeholder:text-fg-muted/50 focus-visible:border-ui-active-soft focus-visible:ring-ui-active-soft/20 min-h-[120px]"
            {...register('message')}
          />
          {errors.message && (
            <p className="text-ui-danger mt-1 text-xs">
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="text-fg-muted mb-4 text-xs">{t('form.footnote')}</div>

        {formStatus.message && (
          <div
            className={cn(
              'mb-3 min-h-[1.2em] text-sm',
              formStatus.type === 'error' && 'text-ui-danger',
              formStatus.type === 'success' && 'text-ui-success'
            )}
            role="alert"
            aria-live="polite"
          >
            {formStatus.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-ui-active-soft hover:bg-ui-active w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition"
        >
          {isSubmitting ? t('submit.sending') : t('submit.default')}
        </Button>
      </form>
    </div>
  );
}
