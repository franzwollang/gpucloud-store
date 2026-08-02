/* eslint-disable @typescript-eslint/consistent-type-imports */
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale, type SupportedLocale } from '.';
import type { MessagesShape } from './appMessages';

type LocaleMessagesModule = { default: MessagesShape };

const loadMessages: Record<
  SupportedLocale,
  () => Promise<LocaleMessagesModule>
> = {
  'en-US': () => import('../../public/locales/en-US'),
  de: () => import('../../public/locales/de'),
  es: () => import('../../public/locales/es'),
  fr: () => import('../../public/locales/fr'),
  'pt-BR': () => import('../../public/locales/pt-BR'),
  hi: () => import('../../public/locales/hi')
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const resolvedLocale: SupportedLocale =
    requested && isSupportedLocale(requested) ? requested : defaultLocale;

  const messagesModule = await loadMessages[resolvedLocale]();

  return {
    locale: resolvedLocale,
    messages: messagesModule.default
  };
});
