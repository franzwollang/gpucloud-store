"use client";

import { useTranslations } from 'next-intl';
import { type NavLink, linksConfig } from './links';
import { useMemo } from 'react';

export default function useLinks() {
  const t = useTranslations();

  const links = useMemo(() => {
    const locationLinks = linksConfig.location.map(link => {
      return {
        type: 'withAnchor',
        href: link.href,
        text: t(link.textKey),
        // NOTE: All current `linksConfig.location` entries provide an anchor key.
        // If we later add truly "simple" (no-anchor) links, reintroduce the
        // branch and adjust the `NavLink` union accordingly.
        intlAnchorKey: link.intlAnchorKey!,
        intlAnchor: t(link.intlAnchorKey!)
      } as const;
    });

    return {
      locations: [...locationLinks],
    } as const satisfies Record<string, NavLink[]>;
  }, [t]);

  return links;
}

export type NavLinks = ReturnType<typeof useLinks>;
