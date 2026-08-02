import { useLocale } from 'next-intl';
import { useAppTranslations } from '@/i18n';

import { PageAnchor } from '@/components/layout-navigation/links';
import { ContactWithPlanForm } from '@/components/forms/contact-with-plan-form';
import { contactPageModel } from '@/core/contact/contactPageModel';
import { ClientPageProvider } from 'dullahan-web/client';

export function ContactSection() {
  const locale = useLocale();
  const t = useAppTranslations('TEST');

  return (
    <PageAnchor
      anchorKey="UI.navLinks.contact.anchor"
      ariaLabel={t('contact.title')('Request a Quote')()}
      className="w-full mt-[5.5rem]"
    >
      <section className="relative z-10 mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-6xl flex-col overflow-hidden px-6 pt-3">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ClientPageProvider model={contactPageModel}>
            <ContactWithPlanForm key={`contact-form-${locale}`} />
          </ClientPageProvider>
        </div>
      </section>
    </PageAnchor>
  );
}
