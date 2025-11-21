import pick from 'just-pick';
import { NextIntlClientProvider, useMessages } from 'next-intl';

import type { SupportedLocale } from '@/i18n';

type ProviderProps = {
  locale: SupportedLocale;
  children: React.ReactNode | React.ReactNode[];
};

export default function ProvidersServer({ children, locale }: ProviderProps) {
  const messages = useMessages();

  return (
    <>
      <NextIntlClientProvider messages={pick(messages, ['UI'])} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
