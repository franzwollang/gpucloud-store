import { useLocale, useTranslations } from 'next-intl';

import { ContactWithPlanForm } from '@/components/forms/contact-with-plan-form';

export function ContactSection() {
  const locale = useLocale();
  const t = useTranslations('TEST');

  return (
    <section
      id="contact"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20"
    >
      <div className="mb-8">
        <div className="text-fg-soft mb-2 text-xs tracking-[0.2em] uppercase">
          {t('contact.eyebrow')}
        </div>
        <h2 className="text-fg-main mb-2 text-2xl font-semibold">
          {t('contact.title')}
        </h2>
        <p className="text-fg-soft max-w-2xl text-base">
          {t('contact.subtitle')}
        </p>
      </div>

      <ContactWithPlanForm key={`contact-form-${locale}`} />
    </section>
  );
}
