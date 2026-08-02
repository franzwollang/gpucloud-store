'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/style';

import { catalogSource } from '@public/data';

type CatalogAttributionProps = {
  className?: string;
  /** Include snapshot date when available. */
  showDate?: boolean;
};

/**
 * Muted CC BY credit for the gpurentalprices.com indicative feed.
 * Keep visually quiet — compliance, not a banner.
 */
export function CatalogAttribution({
  className,
  showDate = false
}: CatalogAttributionProps) {
  const t = useTranslations('TEST.catalog');

  return (
    <p
      className={cn(
        'text-fg-muted/70 text-[0.65rem] leading-snug tracking-wide',
        className
      )}
    >
      <a
        href={catalogSource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-fg-muted underline decoration-dotted underline-offset-2 transition-colors"
      >
        {t('attribution')}
      </a>
      {showDate && catalogSource.date ? (
        <span className="ml-1">
          {t('snapshotDate', { date: catalogSource.date })}
        </span>
      ) : null}
    </p>
  );
}
