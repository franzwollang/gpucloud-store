'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppTranslations } from '@/i18n';

import { cn } from '@/lib/style';

import { useUIStore, createAnchorVisibility } from '../../stores/ui';
import DarkModeToggle from './darkModeToggle';
import LanguagePicker from './languagePicker';
import { CustomLink } from './links';
import useLinks from './useLinks';

type NavBarProps = object;

export default function NavBar({}: NavBarProps) {
  const t = useAppTranslations('UI.navbar');
  const skipRef = useRef<HTMLElement>(null);

  const [atTop, setAtTop] = useState(true);

  const { visibilities, setVisibilities } = useUIStore(
    ({ visibilities, setVisibilities }) => ({
      visibilities,
      setVisibilities
    })
  );

  const heroIsVisible = visibilities.hero;

  const { locations: links } = useLinks();

  useEffect(() => {
    document.addEventListener('scroll', () => {
      if (window.scrollY < 1) {
        setAtTop(true);
      } else {
        if (atTop) {
          setAtTop(false);
        }
      }
    });
  }, []);

  let isMac = true;
  try {
    if (window) {
      isMac = /mac/i.test(navigator.userAgent || navigator.platform);
    }
  } catch (error) {}

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 flex h-16 w-full items-center justify-center rounded-b-lg transition-all duration-500',
        !atTop && 'bg-black/70 backdrop-blur-sm',
        !heroIsVisible &&
          'top-[15%] left-[10vw] h-fit w-fit rounded-md bg-white p-6'
      )}
    >
      <div
        className={cn(
          'flex flex-grow items-center justify-around py-2',
          !heroIsVisible && 'flex-col items-start gap-4'
        )}
      >
        <div
          aria-hidden
          className={cn(
            'invisible flex grow basis-1/6 justify-center',
            !heroIsVisible && 'hidden'
          )}
        />
        <div
          className={cn(
            'flex grow-[2] basis-3/6 items-center justify-center gap-2 text-sm text-white dark:text-white',
            !heroIsVisible &&
              'text-grey-500 w-full flex-col items-start gap-0 border-l-2 border-[#DFDBD1]'
          )}
        >
          {
            <div
              onClick={() => {
                skipRef.current?.focus();
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  skipRef.current?.focus();
                }
              }}
              tabIndex={0}
              className="sr-only bg-yellow-400 p-2 font-bold text-blue-500 focus:not-sr-only focus:cursor-pointer"
            >
              {t('skipNavigation')('Skip Navigation')()}
            </div>
          }
          {links.map(link => {
            if (link.type !== 'withAnchor') return null;

            const highlightedLink =
              visibilities.anchorRankings.find(anchor => anchor.ratio > 0)?.id ??
              '';

            return (
              <CustomLink
                key={link.intlAnchor}
                link={link}
                onClick={() => {
                  setVisibilities(visibilities => {
                    return {
                      anchorRankings: [
                        createAnchorVisibility(link.intlAnchor, {
                          ratio: 1,
                          isNear: true,
                          isActive: true
                        }),
                        ...visibilities.anchorRankings.filter(
                          anchor => anchor.id !== link.intlAnchor
                        )
                      ]
                    };
                  });
                }}
                className={cn(
                  'px-2 py-2',
                  !heroIsVisible && 'text-black',
                  !heroIsVisible &&
                    highlightedLink === link.intlAnchor &&
                    'w-full border-b-2 bg-gray-500/30'
                )}
              />
            );
          })}
        </div>
        {heroIsVisible && (
          <>
            <div className="flex grow basis-1/5 justify-center gap-4">
              <LanguagePicker
                className="border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-200 dark:bg-white dark:hover:bg-slate-100 dark:hover:text-slate-900"
                placeholderText={''}
                noResultsText={''}
              />
              <DarkModeToggle />
              <span
                aria-label={t('openCommandPalette')('Press {modifier} and K to open the command palette.')({
                  modifier: isMac ? 'command' : 'control'
                })}
                ref={heroIsVisible ? skipRef : undefined}
                tabIndex={0}
                className="inline-flex items-center justify-center gap-1 text-white"
              >
                <span className="text-xs">{isMac ? '⌘' : 'ctrl'}</span>
                <span>K</span>
              </span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
