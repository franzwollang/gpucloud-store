// type half-way works, but allows for some invalid combinations
'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';

import type { MessageLeafPaths } from '@/i18n';
import type { PathsEndingWith } from '@/lib/typing';
import { cn } from '@/lib/style';
import { Link } from '@/navigation';
import { useUIStore, type AnchorVisibility } from '@/stores/ui';

type AnchorKey = PathsEndingWith<MessageLeafPaths, '.anchor'>;

export type NavLinkConfig = Readonly<{
  textKey: PathsEndingWith<MessageLeafPaths, '.linkText'>;
  intlAnchorKey?: AnchorKey;
  href: string;
}>;

export type NavLink = Readonly<
  | {
      type: 'simple';
      href: string;
      text: string;
    }
  | {
      type: 'withAnchor';
      href: string;
      text: string;
      intlAnchor: string;
      intlAnchorKey: NonNullable<NavLinkConfig['intlAnchorKey']>;
    }
>;

type CustomLinkProps = {
  link: NavLink;
  className?: string;
  onClick?: () => void;
};

export function CustomLink({ link, className, onClick }: CustomLinkProps) {
  return (
    <Link
      tabIndex={0}
      onClick={onClick}
      href={
        link.href + `${link.type === 'withAnchor' ? '#' + link.intlAnchor : ''}`
      }
      className={cn(className, '')}
    >
      {link.text}
    </Link>
  );
}

export function useAnchorId(anchorKey: AnchorKey) {
  const t = useTranslations();
  return t(anchorKey);
}

export function PageAnchor({
  anchorKey,
  children,
  ariaLabel,
  className
}: {
  anchorKey: AnchorKey;
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const id = useAnchorId(anchorKey);
  return (
    <div
      aria-label={ariaLabel}
      tabIndex={0}
      id={id}
      className={cn('scroll-m-[33vh] scroll-smooth', className)}
    >
      {children}
    </div>
  );
}

export const pageAnchorKeys = [
  'UI.navLinks.home.anchor',
  'UI.navLinks.about.anchor',
  'TEST.availability.anchor',
  'TEST.useCases.anchor',
  'UI.navLinks.contact.anchor'
] as const satisfies ReadonlyArray<AnchorKey>;

export function PageDirector() {
  const t = useTranslations();
  const setVisibilities = useUIStore(state => state.setVisibilities);
  const ratiosRef = useRef<Record<string, number>>({});

  const anchorIds = useMemo(() => {
    return pageAnchorKeys.map(key => t(key));
  }, [t]);

  const heroAnchor = useMemo(() => t('UI.navLinks.home.anchor'), [t]);

  useEffect(() => {
    ratiosRef.current = Object.fromEntries(
      anchorIds.map(id => [id, ratiosRef.current[id] ?? 0])
    );
    const elements = anchorIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        let didUpdate = false;
        entries.forEach(entry => {
          const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
          const id = entry.target.id;
          if (ratiosRef.current[id] !== ratio) {
            ratiosRef.current[id] = ratio;
            didUpdate = true;
          }
        });

        if (!didUpdate) return;

        const rankings: AnchorVisibility[] = Object.entries(ratiosRef.current)
          .map(([id, ratio]) => ({ id, ratio }))
          .sort((a, b) => b.ratio - a.ratio);

        setVisibilities(visibilities => ({
          anchorRankings: rankings,
          hero: (ratiosRef.current[heroAnchor] ?? 0) > 0
        }));
      },
      {
        threshold: [0, 0.2, 0.45, 0.7]
      }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [anchorIds, heroAnchor, setVisibilities]);

  return null;
}

type AnchorRankingsCallback = (rankings: ReadonlyArray<AnchorVisibility>) => void;

export function subscribeToAnchorRankings(callback: AnchorRankingsCallback) {
  let prev = useUIStore.getState().visibilities.anchorRankings;

  // Subscribe to ANY store change and only invoke callback when anchorRankings changes.
  return useUIStore.subscribe(state => {
    const next = state.visibilities.anchorRankings;
    if (next === prev) return;
    prev = next;
    callback(next);
  });
}

export function useOnAnchorRankingsChange(callback: AnchorRankingsCallback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = subscribeToAnchorRankings(rankings => {
      callbackRef.current(rankings);
    });

    return unsubscribe;
  }, []);
}

export const linksConfig = {
  location: [
    {
      textKey: 'UI.navLinks.home.linkText',
      intlAnchorKey: 'UI.navLinks.home.anchor',
      href: '/'
    },
    {
      textKey: 'UI.navLinks.about.linkText',
      intlAnchorKey: 'UI.navLinks.about.anchor',
      href: '/'
    },
    {
      textKey: 'UI.navLinks.contact.linkText',
      intlAnchorKey: 'UI.navLinks.contact.anchor',
      href: '/'
    }
  ]
} as const satisfies Record<string, NavLinkConfig[]>;
