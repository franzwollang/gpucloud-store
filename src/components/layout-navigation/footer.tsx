'use client';

import { useAppTranslations } from '@/i18n';
import { cn } from '@/lib/style';
import { Link } from '@/navigation';

import { catalogSources } from '@public/data';

type SiteFooterProps = {
  className?: string;
};

/**
 * Compact page footer: legal links + muted credits for active catalog feeds.
 */
export function SiteFooter({ className }: SiteFooterProps) {
  const t = useAppTranslations('HOME.footer');
  const tLegal = useAppTranslations('UI.legal');
  const tCatalog = useAppTranslations('TEST.catalog');

  return (
    <footer
      className={cn(
        'border-border/40 text-fg-muted/55 shrink-0 border-t px-6 py-4 text-[10px] leading-relaxed',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{t('copyright')('© GPUcloud.store')()}</span>
          <span className="text-fg-muted/30" aria-hidden="true">
            ·
          </span>
          <Link
            href="/impressum"
            className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
          >
            {tLegal('impressumTitle')('Impressum')()}
          </Link>
          <Link
            href="/privacy"
            className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
          >
            {t('links.privacy')('Privacy')()}
          </Link>
        </div>

        {catalogSources.length > 0 ? (
          <p className="text-fg-muted/45 max-w-xl sm:text-right">
            <span className="mr-1">
              {t('pricingDataVia')('Indicative pricing via')()}
            </span>
            {catalogSources.map((source, index) => (
              <span key={source.id}>
                {index > 0 ? (
                  <span>{tCatalog('sourceSeparator')(', ')()}</span>
                ) : null}
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
                >
                  {source.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

/** @deprecated Prefer `SiteFooter`. */
export default SiteFooter;
