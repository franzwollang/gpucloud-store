import type { AppMessages } from '@/i18n';
import type { AppTranslator } from '@/i18n/t';
import type { MessageLeafPaths } from '@/i18n';
import type { PathValue, PathsEndingWith } from '@/lib/typing';

export function translateWithDefault<D extends string>(
  t: AppTranslator<Record<string, unknown>>,
  key: string,
  defaultText: D,
  values?: Record<string, string | number | Date>
): string {
  const invoke = t as unknown as (
    k: string
  ) => (literal: string) => (...args: [Record<string, string | number | Date>?]) => string;

  return values
    ? invoke(key)(defaultText)(values)
    : invoke(key)(defaultText)();
}

export type HaloSearchTranslator = AppTranslator<
  PathValue<AppMessages, 'TEST.haloSearch'>
>;

export const anchorDefaultLang = {
  'UI.navLinks.home.anchor': 'home',
  'UI.navLinks.about.anchor': 'about',
  'TEST.availability.anchor': 'featured-availability',
  'TEST.useCases.anchor': 'use-cases',
  'UI.navLinks.contact.anchor': 'contact'
} as const satisfies Record<
  PathsEndingWith<MessageLeafPaths, '.anchor'>,
  string
>;

export const navLinkTextDefaultLang = {
  'UI.navLinks.home.linkText': 'Home',
  'UI.navLinks.about.linkText': 'About',
  'UI.navLinks.contact.linkText': 'Contact'
} as const satisfies Record<
  PathsEndingWith<MessageLeafPaths, '.linkText'>,
  string
>;

export function translateRootKey<K extends keyof typeof anchorDefaultLang & string>(
  t: AppTranslator<AppMessages>,
  key: K
): string {
  return translateWithDefault(t, key, anchorDefaultLang[key]);
}

export function translateNavLinkText<
  K extends keyof typeof navLinkTextDefaultLang & string
>(t: AppTranslator<AppMessages>, key: K): string {
  return translateWithDefault(t, key, navLinkTextDefaultLang[key]);
}
