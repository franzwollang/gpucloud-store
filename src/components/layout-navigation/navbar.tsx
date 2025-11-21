'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/style';

import { useUIStore } from '../../stores/ui';
import DarkModeToggle from './darkModeToggle';
import LanguagePicker from './languagePicker';
import { CustomLink } from './links';
import useLinks from './useLinks';

type NavBarProps = {};

export default function NavBar({}: NavBarProps) {
  const skipRef = useRef<HTMLElement>(null);

  const [atTop, setAtTop] = useState(true);

  const [visibilities, setVisibilities] = useUIStore(state => [
    state.visibilities,
    state.setVisibilities
  ]);

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
            !heroIsVisible && 'visible'
          )}
        >
          {!heroIsVisible && (
            <span className="inline-flex items-center justify-center gap-2 text-gray-500">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              </div>
              <div>
                <span className="uppercase">Unite</span> Berlin
              </div>
            </span>
          )}
        </div>
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
              Skip Navigation
            </div>
          }
          {links.map(link => {
            const highlightedLink = visibilities.anchors[0] || '';

            return (
              <CustomLink
                key={link.intlAnchor}
                link={link}
                onClick={() => {
                  setVisibilities(visibilities => {
                    return {
                      anchors: [link.intlAnchor, ...visibilities.anchors]
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
                aria-label={`Press ${isMac ? 'command' : 'control'} and 'K' to open the command palette.`}
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
        {!heroIsVisible && (
          <NewsLetterButton
            //@ts-ignore
            ref={skipRef}
            variant="default"
            className="bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-900/90"
          />
        )}
      </div>
    </nav>
  );
}
