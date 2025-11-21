import { defineRouting } from 'next-intl/routing';

import { defaultLocale, localePrefix, supportedLocales } from '.';

export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale,
  localePrefix,
  localeDetection: true,
  alternateLinks: true
});
