// type half-way works, but allows for some invalid combinations
'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useAppTranslations } from '@/i18n';

import type { MessageLeafPaths } from '@/i18n';
import { translateNavLinkText, translateRootKey } from '@/i18n/helpers';
import {
  clearExitDwellLatch,
  EXIT_DWELL_MS,
  NEAR_ROOT_MARGIN,
  syncExitDwellLatch,
  type ExitDwellLatch
} from '@/lib/animation/sectionVisibility';
import type { PathsEndingWith } from '@/lib/typing';
import { cn } from '@/lib/style';
import { Link } from '@/navigation';
import {
  createAnchorVisibility,
  useUIStore,
  type AnchorVisibility
} from '@/stores/ui';

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
  const t = useAppTranslations();
  return translateRootKey(t, anchorKey);
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
  const t = useAppTranslations();
  const { setVisibilities } = useUIStore(({ setVisibilities }) => ({
    setVisibilities
  }));
  const ratiosRef = useRef<Record<string, number>>({});
  const nearLatchesRef = useRef<Record<string, ExitDwellLatch>>({});
  const activeLatchesRef = useRef<Record<string, ExitDwellLatch>>({});

  const anchorIds = useMemo(() => {
    return pageAnchorKeys.map(key => translateRootKey(t, key));
  }, [t]);

  const heroAnchor = useMemo(
    () => translateRootKey(t, 'UI.navLinks.home.anchor'),
    [t]
  );

  useEffect(() => {
    const ensureLatch = (
      map: Record<string, ExitDwellLatch>,
      id: string
    ): ExitDwellLatch => {
      const existing = map[id];
      if (existing) return existing;
      const created: ExitDwellLatch = { latched: false, timer: null };
      map[id] = created;
      return created;
    };

    ratiosRef.current = Object.fromEntries(
      anchorIds.map(id => {
        ensureLatch(nearLatchesRef.current, id);
        ensureLatch(activeLatchesRef.current, id);
        return [id, ratiosRef.current[id] ?? 0];
      })
    );

    const elements = anchorIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const publish = () => {
      const rankings: AnchorVisibility[] = anchorIds
        .map(id =>
          createAnchorVisibility(id, {
            ratio: ratiosRef.current[id] ?? 0,
            isNear: nearLatchesRef.current[id]?.latched ?? false,
            isActive: activeLatchesRef.current[id]?.latched ?? false
          })
        )
        .sort((a, b) => b.ratio - a.ratio);

      const nextHero = activeLatchesRef.current[heroAnchor]?.latched ?? false;
      const prev = useUIStore.getState().visibilities;
      const sameHero = prev.hero === nextHero;
      const sameRankings =
        prev.anchorRankings.length === rankings.length &&
        prev.anchorRankings.every((entry, i) => {
          const next = rankings[i];
          return (
            next != null &&
            entry.id === next.id &&
            entry.ratio === next.ratio &&
            entry.isNear === next.isNear &&
            entry.isActive === next.isActive
          );
        });
      if (sameHero && sameRankings) return;

      setVisibilities(() => ({
        anchorRankings: rankings,
        hero: nextHero
      }));
    };

    const syncKind = (
      kind: 'near' | 'active',
      id: string,
      raw: boolean
    ) => {
      const map =
        kind === 'near' ? nearLatchesRef.current : activeLatchesRef.current;
      syncExitDwellLatch(
        ensureLatch(map, id),
        raw,
        EXIT_DWELL_MS,
        publish
      );
    };

    const activeObserver = new IntersectionObserver(
      entries => {
        let ratioChanged = false;
        entries.forEach(entry => {
          const id = entry.target.id;
          const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
          if (ratiosRef.current[id] !== ratio) {
            ratiosRef.current[id] = ratio;
            ratioChanged = true;
          }
          syncKind('active', id, entry.isIntersecting);
        });
        if (ratioChanged) publish();
      },
      {
        threshold: [0, 0.2, 0.45, 0.7]
      }
    );

    const nearObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          syncKind('near', entry.target.id, entry.isIntersecting);
        });
      },
      {
        rootMargin: NEAR_ROOT_MARGIN,
        threshold: [0]
      }
    );

    elements.forEach(el => {
      activeObserver.observe(el);
      nearObserver.observe(el);
    });

    const syncDocumentPolicy = () => {
      const pageVisible = document.visibilityState !== 'hidden';
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const prev = useUIStore.getState().visibilities;
      if (
        prev.pageVisible === pageVisible &&
        prev.prefersReducedMotion === prefersReducedMotion
      ) {
        return;
      }
      setVisibilities(() => ({
        pageVisible,
        prefersReducedMotion
      }));
    };

    syncDocumentPolicy();
    document.addEventListener('visibilitychange', syncDocumentPolicy);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => syncDocumentPolicy();
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      activeObserver.disconnect();
      nearObserver.disconnect();
      document.removeEventListener('visibilitychange', syncDocumentPolicy);
      motionQuery.removeEventListener('change', onMotionChange);
      for (const id of anchorIds) {
        const near = nearLatchesRef.current[id];
        const active = activeLatchesRef.current[id];
        if (near) clearExitDwellLatch(near);
        if (active) clearExitDwellLatch(active);
      }
    };
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

/**
 * Effective section flags for animation gating.
 * `isActive` / `isNear` are false while the document tab is hidden or a
 * page-level smooth-scroll pause is active.
 * Object selector is OK — `useUIStore` defaults to shallow equality.
 */
export function useSectionVisibility(anchorId: string): {
  ratio: number;
  isNear: boolean;
  isActive: boolean;
  prefersReducedMotion: boolean;
  scrollPaused: boolean;
} {
  return useUIStore(state => {
    const entry = state.visibilities.anchorRankings.find(
      e => e.id === anchorId
    );
    const pageVisible = state.visibilities.pageVisible;
    const scrollPaused = state.visibilities.scrollPaused;
    const motionOk = pageVisible && !scrollPaused;
    return {
      ratio: entry?.ratio ?? 0,
      isNear: Boolean(entry?.isNear) && motionOk,
      isActive: Boolean(entry?.isActive) && motionOk,
      prefersReducedMotion: state.visibilities.prefersReducedMotion,
      scrollPaused
    };
  });
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
