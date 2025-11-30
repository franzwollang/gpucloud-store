import { useEffect, useState } from 'react';

const isRenderingOnServer = typeof window === 'undefined';

const QUERY = '(prefers-reduced-motion: no-preference)';

function getInitialState() {
  return isRenderingOnServer ? true : !window.matchMedia(QUERY).matches;
}

export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialState);
  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);

    function listener(event: any) {
      setPrefersReducedMotion(!event.matches);
    }

    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, []);
  return prefersReducedMotion;
}
