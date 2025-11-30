'use client';

import { useEffect, useState } from 'react';

export function useClientMediaQuery(
  query: string,
  handler?: (e: MediaQueryListEvent) => void
) {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleMatchChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
      if (handler) handler(e);
    };

    mediaQueryList.addEventListener('change', handleMatchChange);
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener('change', handleMatchChange);
    };
  }, [query, handler]);

  return matches;
}
