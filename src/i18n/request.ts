/* eslint-disable @typescript-eslint/consistent-type-imports */
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale } from '.';

type Messages = typeof import('../../public/locales/en-US.json');

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = defaultLocale;
  }

  const messagesModule = (await import(
    `../../public/locales/${locale}.json`
  )) as { default: Messages };

  return {
    locale,
    messages: messagesModule.default
  };
});
