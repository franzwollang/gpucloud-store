import { useLocale, useTranslations } from 'next-intl';

import { PageAnchor } from '@/components/layout-navigation/links';
import { ContactWithPlanForm } from '@/components/forms/contact-with-plan-form';
import { contactPageModel } from '@/core/contact/contactPageModel';
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
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-6 pt-3 h-[calc(100vh-5.5rem)]">
        <div className="flex-1 min-h-0">
          <ClientPageProvider model={contactPageModel}>
            <ContactWithPlanForm key={`contact-form-${locale}`} />
          </ClientPageProvider>
        </div>
      </section>
    </PageAnchor>
  );
}
