import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import type { Locale as Localizer } from 'date-fns';
import { de, enUS, es, fr, hi, ptBR } from 'date-fns/locale';
import index from 'just-index';
import type { Messages } from 'next-intl';
import type { UnionToIntersection } from 'ts-essentials';

import type { PathValue } from '@/lib/typing';

export type RawMessageType<Path extends string> = PathValue<Messages, Path>;

type Locale = {
  locale: string;
  label: string;
  icon: string | (<P>(props: P) => React.JSX.Element);
  localizer: Localizer;
};

const locales = [
  {
    label: 'English',
    locale: 'en-US',
    icon: getUnicodeFlagIcon('US'),
    localizer: enUS
  },
  {
    label: 'Deutsch',
    locale: 'de',
    icon: getUnicodeFlagIcon('DE'),
    localizer: de
  },
  {
    label: 'Español',
    locale: 'es',
    icon: getUnicodeFlagIcon('ES'),
    localizer: es
  },
  {
    label: 'Français',
    locale: 'fr',
    icon: getUnicodeFlagIcon('FR'),
    localizer: fr
  },
  {
    label: 'Português',
    locale: 'pt-BR',
    icon: getUnicodeFlagIcon('BR'),
    localizer: ptBR
  },
  {
    label: 'हिन्दी',
    locale: 'hi',
    icon: getUnicodeFlagIcon('IN'),
    localizer: hi
  }
] as const satisfies Locale[];

type LocalesToCodes<T extends Readonly<Array<Locale>>> = UnionToIntersection<{
  [K in keyof T]: T[K]['locale'];
}>;

export const supportedLocales = locales.map(
  ({ locale }) => locale
) as unknown as LocalesToCodes<typeof locales>;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale = 'en-US' satisfies SupportedLocale;

export const isSupportedLocale = (
  locale: string
): locale is SupportedLocale => {
  return supportedLocales.some(supportedLocale => supportedLocale === locale);
};

type LocalesToKeyedDict<T extends Readonly<Array<Locale>>> =
  UnionToIntersection<
    {
      [K in keyof T]: Record<T[K]['locale'], T[K]>;
    }[number]
  >;

export const localesByCode = index(locales, 'locale') as LocalesToKeyedDict<
  typeof locales
>;

export type LocalePrefix = 'as-needed' | 'always' | 'never';
export const localePrefix = 'always' satisfies LocalePrefix;
