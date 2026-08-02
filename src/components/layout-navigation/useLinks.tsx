"use client";

import { useAppTranslations } from '@/i18n';
import { translateNavLinkText, translateRootKey } from '@/i18n/helpers';
import { type NavLink, linksConfig } from './links';
import { useMemo } from 'react';

export default function useLinks() {
  const t = useAppTranslations();

  const links = useMemo(() => {
    const locationLinks = linksConfig.location.map(link => {
      return {
        type: 'withAnchor',
        href: link.href,
        text: translateNavLinkText(t, link.textKey),
        intlAnchorKey: link.intlAnchorKey!,
        intlAnchor: translateRootKey(t, link.intlAnchorKey!)
      } as const;
    });

    return {
      locations: [...locationLinks],
    } as const satisfies Record<string, NavLink[]>;
  }, [t]);

  return links;
}

export type NavLinks = ReturnType<typeof useLinks>;
