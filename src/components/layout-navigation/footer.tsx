import { getTranslations } from 'next-intl/server';

import { Link } from '@/navigation';

export default async function Footer() {
  const t = await getTranslations('HOME');
  const tNav = await getTranslations('UI.navLinks');

  return (
    <footer className="border-border/60 bg-bg-surface text-fg-muted border-t px-5 py-5 text-xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div>{t('footer.copyright')}</div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`#${tNav('about.anchor')}`}
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.about')}
          </a>
          <a
            href={`#${tNav('contact.anchor')}`}
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.contact')}
          </a>
          <a
            href="mailto:shrey@gpucloud.store"
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.email')}
          </a>
          <Link
            href="/impressum"
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            Imprint
          </Link>
          <Link
            href="/privacy"
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            Data Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
