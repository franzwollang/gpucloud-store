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
      <NextIntlClientProvider key={locale} messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
