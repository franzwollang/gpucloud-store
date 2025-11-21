import { getTranslations } from '@/i18n';
import { Link } from '@/navigation';

export default async function Footer() {
  const t = await getTranslations('HOME');

  return (
    <footer className="border-t border-cyan-400/20 bg-linear-to-b from-slate-900/96 to-slate-950 px-5 py-5 text-xs text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div>{t('footer.copyright')}</div>
        <div className="flex flex-wrap gap-3">
          <a
            href="#about"
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-cyan-300"
          >
            {t('footer.links.about')}
          </a>
          <a
            href="#contact"
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-cyan-300"
          >
            {t('footer.links.contact')}
          </a>
          <a
            href="mailto:shrey@gpucloud.store"
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-cyan-300"
          >
            {t('footer.links.email')}
          </a>
          <Link
            href="/impressum"
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-cyan-300"
          >
            Imprint
          </Link>
          <Link
            href="/privacy"
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-cyan-300"
          >
            Data Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
