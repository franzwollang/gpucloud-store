import { useLocale, useTranslations } from 'next-intl';

import { PageAnchor } from '@/components/layout-navigation/links';
import { ContactWithPlanForm } from '@/components/forms/contact-with-plan-form';
import { contactPageModel } from '@/core/contact';
import { ClientPageProvider } from 'dullahan-web/client';

export function ContactSection() {
  const locale = useLocale();
  const t = useTranslations('TEST');

  return (
    <PageAnchor
      anchorKey="UI.navLinks.contact.anchor"
      ariaLabel={t('contact.title')}
      className="w-full mt-[5.5rem]"
    >
      <section className="relative z-10 mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col px-6 pt-3">
        <div className="flex min-h-0 flex-1 flex-col">
          <ClientPageProvider model={contactPageModel}>
            <ContactWithPlanForm key={`contact-form-${locale}`} />
          </ClientPageProvider>
        </div>
      </section>
    </PageAnchor>
  );
}
