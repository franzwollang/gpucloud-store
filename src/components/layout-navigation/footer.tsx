import { getAppTranslations } from '@/i18n';

import { Link } from '@/navigation';

export default async function Footer() {
  const t = await getAppTranslations('HOME');
  const tNav = await getAppTranslations('UI.navLinks');

  return (
    <footer className="border-border/60 bg-bg-surface text-fg-muted border-t px-5 py-5 text-xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div>{t('footer.copyright')('© GPUcloud.store')()}</div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`#${tNav('about.anchor')('about')()}`}
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.about')('About')()}
          </a>
          <a
            href={`#${tNav('contact.anchor')('contact')()}`}
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.contact')('Contact')()}
          </a>
          <a
            href="mailto:shrey@gpucloud.store"
            className="hover:text-ui-active-soft underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('footer.links.email')('Email')()}
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
