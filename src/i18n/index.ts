/* eslint-disable @typescript-eslint/consistent-type-imports */
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import type { Locale as Localizer } from 'date-fns';
import { de, enGB, es, fr, hi, ptBR } from 'date-fns/locale';
import index from 'just-index';
import type { useTranslations } from 'next-intl';
import { getTranslations as getBaseTranslations } from 'next-intl/server';
import type { UnionToIntersection } from 'ts-essentials';

import type { LeafPaths, NestedKeys, PathsWithoutIndices } from '@/lib/typing';

type Messages = typeof import('../../public/locales/en-US.json');

// typing pulled from default locale file
export type validTranslationKeys = Parameters<typeof useTranslations>[0];

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
    localizer: enGB
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
] as const;

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

export type MessagePaths = PathsWithoutIndices<Messages>;
export type MessageLeafPaths = LeafPaths<MessagePaths>;

export async function getTranslations<
  NS extends MessagePaths | undefined = undefined
>(namespace?: NS) {
  const t = await getBaseTranslations(namespace);

  type TFunc = typeof t;
  type TParams = Parameters<TFunc>;

  type AllowedKeys = NS extends string
    ? NestedKeys<MessageLeafPaths, NS>
    : MessageLeafPaths;

  const typedT = (
    key: AllowedKeys,
    values?: TParams[1],
    formats?: TParams[2]
  ): ReturnType<TFunc> => t(key as TParams[0], values, formats);

  return typedT;
}
