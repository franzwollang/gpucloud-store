'use client';

import { useEffect } from 'react';
import { useAppTranslations } from '@/i18n';

import { smoothScrollToContact } from '@/lib/animation/scrollPause';

/**
 * Intercept in-page clicks to the contact hash so CSS `scroll-smooth`
 * goes through the animation pause path (footer / nav links).
 */
export function ContactScrollPauseBridge() {
  const t = useAppTranslations();
  const contactAnchor = t('UI.navLinks.contact.anchor')('contact')();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.includes('#')) return;

      let hash = '';
      try {
        const url = new URL(href, window.location.href);
        if (url.pathname !== window.location.pathname) return;
        hash = url.hash.replace(/^#/, '');
      } catch {
        const idx = href.indexOf('#');
        hash = idx >= 0 ? href.slice(idx + 1) : '';
      }

      if (hash !== contactAnchor) return;
      if (!document.getElementById(contactAnchor)) return;

      event.preventDefault();
      void smoothScrollToContact(contactAnchor);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [contactAnchor]);

  return null;
}
