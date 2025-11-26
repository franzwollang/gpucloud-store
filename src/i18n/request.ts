/* eslint-disable @typescript-eslint/consistent-type-imports */
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale } from '.';

type Messages = typeof import('../../public/locales/en-US.json');

export default getRequestConfig(async ({ requestLocale }) => {
  let resolvedLocale = await requestLocale;

  if (!resolvedLocale || !isSupportedLocale(resolvedLocale)) {
    resolvedLocale = defaultLocale;
  }

  const messagesModule = (await import(
    `../../public/locales/${resolvedLocale}.json`
  )) as { default: Messages };

  return {
    locale: resolvedLocale,
    messages: messagesModule.default
  };
});
